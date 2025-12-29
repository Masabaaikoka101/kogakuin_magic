/**
 * ページ遷移のSPA化 - View Transitions API対応
 * 
 * シンプルで堅牢な実装:
 * - 内部リンクのクリックをインターセプト
 * - fetchでHTMLを取得してmainを差し替え
 * - View Transitions APIでフェードアニメーション
 * - プリフェッチでホバー時に先読み
 * - 履歴管理（戻る/進むボタン対応）
 */

(function () {
    'use strict';

    // ============================================
    // 設定
    // ============================================
    const PREFETCH_DELAY = 150;
    const pageCache = new Map();

    // ============================================
    // ユーティリティ
    // ============================================

    /**
     * URLを正規化（比較用）
     */
    function normalizeUrl(url) {
        try {
            const u = new URL(url, location.origin);
            // index.htmlを/に正規化
            let path = u.pathname.replace(/\/index\.html$/i, '/');
            // 末尾の/を削除（ルート以外）
            if (path !== '/' && path.endsWith('/')) {
                path = path.slice(0, -1);
            }
            return u.origin + path + u.search;
        } catch {
            return url;
        }
    }

    /**
     * 内部リンクかどうか判定
     */
    function isInternalLink(link) {
        if (!link || !link.href) return false;
        if (link.target === '_blank') return false;
        if (link.hasAttribute('download')) return false;

        try {
            const url = new URL(link.href);
            // 同じホストのみ
            if (url.host !== location.host) return false;
            // httpまたはhttpsのみ
            if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
            // ハッシュのみのリンクは除外
            if (url.pathname === location.pathname && url.hash && !url.search) return false;
            return true;
        } catch {
            return false;
        }
    }

    /**
     * 同じページかどうか判定
     */
    function isSamePage(url) {
        return normalizeUrl(url) === normalizeUrl(location.href);
    }

    // ============================================
    // ページフェッチ
    // ============================================

    /**
     * ページHTMLをフェッチ
     */
    async function fetchPage(url) {
        const normalized = normalizeUrl(url);

        if (pageCache.has(normalized)) {
            return pageCache.get(normalized);
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const html = await response.text();
        pageCache.set(normalized, html);
        return html;
    }

    /**
     * HTMLをパース
     */
    function parseHtml(html) {
        const parser = new DOMParser();
        return parser.parseFromString(html, 'text/html');
    }

    // ============================================
    // DOM更新
    // ============================================

    /**
     * ページを更新
     */
    function updatePage(doc) {
        // タイトル更新
        document.title = doc.title;

        // lang属性更新
        const newLang = doc.documentElement.lang;
        if (newLang) {
            document.documentElement.lang = newLang;
        }

        // body属性更新
        const newDataPage = doc.body.getAttribute('data-page');
        if (newDataPage) {
            document.body.setAttribute('data-page', newDataPage);
        }

        // mainコンテンツ差し替え
        const currentMain = document.querySelector('main');
        const newMain = doc.querySelector('main');
        if (currentMain && newMain) {
            currentMain.innerHTML = newMain.innerHTML;
        }

        // メタタグ更新
        updateMeta(doc);

        // スクロール位置リセット
        window.scrollTo(0, 0);

        // ナビゲーション更新
        updateNav();

        // テーマ画像更新
        updateThemeImages();

        // スクリプト再初期化
        reinitScripts();

        // カスタムイベント発火
        window.dispatchEvent(new CustomEvent('kms:page-updated'));
    }

    /**
     * メタタグ更新
     */
    function updateMeta(doc) {
        const selectors = [
            'meta[name="description"]',
            'meta[property="og:title"]',
            'meta[property="og:description"]',
            'meta[property="og:url"]',
            'link[rel="canonical"]'
        ];

        selectors.forEach(sel => {
            const current = document.querySelector(sel);
            const next = doc.querySelector(sel);
            if (current && next) {
                if (current.hasAttribute('content')) {
                    current.setAttribute('content', next.getAttribute('content') || '');
                } else if (current.hasAttribute('href')) {
                    current.setAttribute('href', next.getAttribute('href') || '');
                }
            }
        });
    }

    /**
     * ナビゲーション状態更新
     */
    function updateNav() {
        const page = document.body.getAttribute('data-page');
        document.querySelectorAll('[data-nav]').forEach(link => {
            if (link.getAttribute('data-nav') === page) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    /**
     * テーマに基づく画像切り替え
     */
    function updateThemeImages() {
        const theme = document.documentElement.getAttribute('data-theme') || 'dark';
        document.querySelectorAll('[data-src-dark][data-src-white]').forEach(img => {
            const src = theme === 'white'
                ? img.getAttribute('data-src-white')
                : img.getAttribute('data-src-dark');
            if (src && img.getAttribute('src') !== src) {
                img.setAttribute('src', src);
            }
        });
    }

    /**
     * スクリプト再初期化
     */
    function reinitScripts() {
        // スクロールアニメーションリセット
        document.querySelectorAll('[data-animate]').forEach(el => {
            el.removeAttribute('data-in-view');
        });

        // IntersectionObserver再設定
        const animated = document.querySelectorAll('[data-animate]');
        if ('IntersectionObserver' in window && animated.length) {
            const io = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.setAttribute('data-in-view', 'true');
                        io.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

            animated.forEach(el => {
                const delay = el.getAttribute('data-animate-delay');
                if (delay) el.style.transitionDelay = `${parseInt(delay, 10)}ms`;
                io.observe(el);
            });
        }

        // 年号更新
        const year = document.getElementById('year');
        if (year) year.textContent = new Date().getFullYear();
    }

    // ============================================
    // 遷移処理
    // ============================================

    let isNavigating = false;

    /**
     * ページ遷移実行
     */
    async function navigateTo(url, pushState = true) {
        // 遷移中なら無視
        if (isNavigating) return;

        // 同じページなら無視
        if (isSamePage(url)) return;

        isNavigating = true;

        try {
            const html = await fetchPage(url);
            const doc = parseHtml(html);

            const performUpdate = () => {
                // DOM更新前にURLを更新して、相対パスの解決基準を合わせる
                if (pushState) {
                    history.pushState({ url: url }, '', url);
                }
                updatePage(doc);
            };

            // View Transitions対応
            if (document.startViewTransition) {
                await document.startViewTransition(performUpdate).finished;
            } else {
                performUpdate();
            }

        } catch (error) {
            console.error('Navigation failed:', error);
            // エラー時は通常遷移
            location.href = url;
        } finally {
            isNavigating = false;
        }
    }

    // ============================================
    // イベントハンドラー
    // ============================================

    /**
     * クリックハンドラー
     */
    function handleClick(e) {
        // 修飾キーは通常動作
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

        const link = e.target.closest('a');
        if (!link || !isInternalLink(link)) return;

        // 同じページなら何もしない
        if (isSamePage(link.href)) {
            e.preventDefault();
            return;
        }

        e.preventDefault();
        navigateTo(link.href);
    }

    /**
     * プリフェッチ
     */
    let prefetchTimer = null;

    function handleMouseOver(e) {
        const link = e.target.closest('a');
        if (!link || !isInternalLink(link)) return;
        if (pageCache.has(normalizeUrl(link.href))) return;

        clearTimeout(prefetchTimer);
        prefetchTimer = setTimeout(() => {
            fetchPage(link.href).catch(() => { });
        }, PREFETCH_DELAY);
    }

    function handleMouseOut() {
        clearTimeout(prefetchTimer);
    }

    /**
     * 戻る/進むボタン
     */
    function handlePopState(e) {
        const url = e.state?.url || location.href;
        navigateTo(url, false);
    }

    // ============================================
    // 初期化
    // ============================================

    function init() {
        // 現在のページを履歴に登録
        history.replaceState({ url: location.href }, '', location.href);

        // イベントリスナー
        document.addEventListener('click', handleClick);
        document.addEventListener('mouseover', handleMouseOver);
        document.addEventListener('mouseout', handleMouseOut);
        window.addEventListener('popstate', handlePopState);
    }

    // DOM準備後に初期化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
