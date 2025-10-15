// 年号 & 現在ページのナビ強調
(function(){
  // フッターの年号を現在の年に更新
  const y = document.getElementById("year");
  if (y) {
    y.textContent = new Date().getFullYear();
  }

  // bodyタグの data-page 属性を元に、現在のナビゲーションリンクを特定
  const page = document.body.getAttribute("data-page");
  const currentNavLink = document.querySelector(`[data-nav="${page}"]`);

  // 該当するナビゲーションリンクがあれば、aria-current属性を設定してアクセシビリティを向上させる
  // ※ CSSでの見た目の強調は、style.css内の `body[data-page="..."]` の記述で実現されています
  if (currentNavLink) {
    currentNavLink.setAttribute("aria-current", "page");
  }
})();