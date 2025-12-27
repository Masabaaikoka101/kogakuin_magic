/**
 * ページ遷移のSPA化 - View Transitions API対応
 * 
 * 機能:
 * - 内部リンクのクリックをインターセプトしてシームレス遷移
 * - View Transitions APIでフェードアニメーション
 * - プリフェッチでホバー時に先読み（高速化）
 * - 履歴管理（戻る/進むボタン対応）
 * - 非対応ブラウザはそのまま通常遷移（Progressive Enhancement）
 * 
 * SEOへの影響: なし
 * - HTMLファイルはそのまま維持
 * - クローラーは通常通りアクセス可能
 */

(function () {
    'use strict';

    // ============================================
    // 設定
    // ============================================
    const CONFIG = {
        // プリフェッチを有効にするホバー時間（ミリ秒）
        prefetchDelay: 100,
        // 遷移アニメーション時間（ミリ秒）
        transitionDuration: 250,
        // 内部リンクと判定するホスト
        allowedHosts: [location.host]
    };

    // ============================================
    // キャッシュ管理
    // ============================================
    const pageCache = new Map();

    /**
     * ページHTMLをフェッチしてキャッシュに保存
     * @param {string} url - 取得するURL
     * @returns {Promise<Document>} パースされたDocument
     */
    async function fetchPage(url) {
        // URLを正規化
        const normalizedUrl = new URL(url, location.origin).href;

        // キャッシュにあればクローンを返す
        if (pageCache.has(normalizedUrl)) {
            const cached = pageCache.get(normalizedUrl);
            // キャッシュされたHTMLを再パース
            return cached;
        }

        const response = await fetch(normalizedUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status}`);
        }

        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // キャッシュに保存
        pageCache.set(normalizedUrl, doc);

        return doc;
    }

    // ============================================
    // DOM更新
    // ============================================

    /**
     * ページコンテンツを更新
     * @param {Document} newDoc - 新しいページのDocument
     */
    function updatePage(newDoc) {
        // タイトルを更新
        document.title = newDoc.title;

        // body の data-page 属性を更新
        const newDataPage = newDoc.body.getAttribute('data-page');
        if (newDataPage) {
            document.body.setAttribute('data-page', newDataPage);
        }

        // main コンテンツを差し替え
        const currentMain = document.querySelector('main');
        const newMain = newDoc.querySelector('main');
        if (currentMain && newMain) {
            currentMain.innerHTML = newMain.innerHTML;
        }

        // メタタグを更新（OGPなど）
        updateMetaTags(newDoc);

        // スクロール位置をリセット
        window.scrollTo(0, 0);

        // ナビゲーションのカレント状態を更新
        updateNavigation();

        // ページ固有のスクリプト初期化（必要に応じて）
        reinitializeScripts();
    }

    /**
     * メタタグを更新
     * @param {Document} newDoc - 新しいページのDocument
     */
    function updateMetaTags(newDoc) {
        const metaSelectors = [
            'meta[name="description"]',
            'meta[property="og:title"]',
            'meta[property="og:description"]',
            'meta[property="og:url"]',
            'link[rel="canonical"]'
        ];

        metaSelectors.forEach(selector => {
            const current = document.querySelector(selector);
            const newMeta = newDoc.querySelector(selector);

            if (current && newMeta) {
                if (current.hasAttribute('content')) {
                    current.setAttribute('content', newMeta.getAttribute('content'));
                } else if (current.hasAttribute('href')) {
                    current.setAttribute('href', newMeta.getAttribute('href'));
                }
            }
        });
    }

    /**
     * ナビゲーションのカレント状態を更新
     */
    function updateNavigation() {
        const page = document.body.getAttribute('data-page');
        const navLinks = document.querySelectorAll('[data-nav]');

        navLinks.forEach(link => {
            const navPage = link.getAttribute('data-nav');
            if (navPage === page) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    /**
     * ページ固有のスクリプトを再初期化
     */
    function reinitializeScripts() {
        // スクロールアニメーションのリセット
        document.querySelectorAll('[data-animate]').forEach(el => {
            el.removeAttribute('data-in-view');
        });

        // IntersectionObserverを再設定
        const animatedEls = document.querySelectorAll('[data-animate]');
        if ('IntersectionObserver' in window && animatedEls.length) {
            const io = new IntersectionObserver((entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        entry.target.setAttribute('data-in-view', 'true');
                        io.unobserve(entry.target);
                    }
                }
            }, { root: null, threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

            animatedEls.forEach((el) => {
                const delay = el.getAttribute('data-animate-delay');
                if (delay) {
                    el.style.transitionDelay = `${parseInt(delay, 10)}ms`;
                }
                io.observe(el);
            });
        }

        // 年号の更新
        const yearEl = document.getElementById('year');
        if (yearEl) {
            yearEl.textContent = new Date().getFullYear();
        }

        // ページ更新イベントを発火（他のスクリプトが再初期化できるように）
        window.dispatchEvent(new CustomEvent('kms:page-updated'));
    }

    // ============================================
    // 遷移処理
    // ============================================

    /**
     * ページ遷移を実行
     * @param {string} url - 遷移先URL
     * @param {boolean} pushState - 履歴に追加するか
     */
    async function navigateTo(url, pushState = true) {
        try {
            // ページをフェッチ
            const newDoc = await fetchPage(url);

            // View Transitions API対応ブラウザ
            if (document.startViewTransition) {
                document.startViewTransition(() => {
                    updatePage(newDoc);
                });
            } else {
                // 非対応ブラウザはそのまま更新
                updatePage(newDoc);
            }

            // 履歴に追加
            if (pushState) {
                history.pushState({ url }, '', url);
            }

        } catch (error) {
            console.error('Page transition failed:', error);
            // エラー時は通常遷移
            location.href = url;
        }
    }

    // ============================================
    // リンク判定
    // ============================================

    /**
     * 内部リンクかどうかを判定
     * @param {HTMLAnchorElement} link - リンク要素
     * @returns {boolean}
     */
    function isInternalLink(link) {
        // 基本チェック
        if (!link || !link.href) return false;
        if (link.target === '_blank') return false;
        if (link.hasAttribute('download')) return false;

        // ホストが一致するか
        try {
            const url = new URL(link.href);
            if (!CONFIG.allowedHosts.includes(url.host)) return false;

            // ハッシュのみの場合は除外
            if (url.pathname === location.pathname && url.hash) return false;

            // 外部プロトコル除外
            if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;

            return true;
        } catch {
            return false;
        }
    }

    // ============================================
    // イベントハンドラー
    // ============================================

    /**
     * リンククリックハンドラー
     * @param {Event} event - クリックイベント
     */
    function handleLinkClick(event) {
        // 修飾キーが押されている場合は通常動作
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
            return;
        }

        const link = event.target.closest('a');
        if (!link || !isInternalLink(link)) return;

        // 同じページへのリンクは無視（パスで比較）
        try {
            const linkUrl = new URL(link.href);
            const currentUrl = new URL(location.href);
            if (linkUrl.pathname === currentUrl.pathname && !linkUrl.hash) {
                event.preventDefault();
                return;
            }
        } catch {
            // URLパースエラー時は通常遷移
            return;
        }

        event.preventDefault();
        navigateTo(link.href);
    }

    /**
     * プリフェッチ用ホバーハンドラー
     */
    let prefetchTimer = null;

    function handleLinkHover(event) {
        const link = event.target.closest('a');
        if (!link || !isInternalLink(link)) return;

        // 既にキャッシュにあれば何もしない
        if (pageCache.has(link.href)) return;

        // 遅延してプリフェッチ
        clearTimeout(prefetchTimer);
        prefetchTimer = setTimeout(() => {
            fetchPage(link.href).catch(() => {
                // プリフェッチ失敗は無視
            });
        }, CONFIG.prefetchDelay);
    }

    function handleLinkLeave() {
        clearTimeout(prefetchTimer);
    }

    /**
     * 戻る/進むボタンハンドラー
     * @param {PopStateEvent} event
     */
    function handlePopState(event) {
        if (event.state && event.state.url) {
            navigateTo(event.state.url, false);
        } else {
            // 初期状態に戻る
            navigateTo(location.href, false);
        }
    }

    // ============================================
    // 初期化
    // ============================================

    function init() {
        // 現在のページを履歴に登録
        history.replaceState({ url: location.href }, '', location.href);

        // イベントリスナー登録
        document.addEventListener('click', handleLinkClick);
        document.addEventListener('mouseover', handleLinkHover);
        document.addEventListener('mouseout', handleLinkLeave);
        window.addEventListener('popstate', handlePopState);

        // 現在のページをキャッシュ
        pageCache.set(location.href, document);
    }

    // DOMContentLoaded で初期化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
