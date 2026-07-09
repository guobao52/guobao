/* =========================================================
   DN云导航站 · 左侧菜单点击跳转修复 + 滚动同步高亮
   叠加脚本（在主题 smooth 脚本之后加载，覆盖其跳转逻辑）
   解决的问题：
     主题原脚本用 $(href).position().top 计算滚动位置，
     而 custom-ig.css 给 h4.text-gray 加了 position:relative，
     导致 <i id="md5"> 的"定位父级"变成 h4，position().top≈0，
     点哪个分类都滚到页面顶部 → 表现为"点击不跳转"。
   本脚本改用 $(href).offset().top（相对整篇文档，稳定可靠）。
   ========================================================= */
(function ($) {
  $(document).ready(function () {

    /* ---------- 1) 点击左侧菜单：平滑跳转到对应区块 ---------- */
    // 先解绑主题原本的 a.smooth 点击处理，再用正确方式接管
    $("a.smooth").off("click").on("click", function (e) {
      var href = $(this).attr("href");
      // 只处理页内锚点（#xxx），其余链接保持原样
      if (!href || href.charAt(0) !== "#") return;
      var $target = $(href);
      if ($target.length === 0) return;          // 找不到目标就不拦截

      e.preventDefault();

      // 高亮当前项
      $("#main-menu li").removeClass("active");
      $(this).parent("li").addClass("active");

      // 滚动到目标区块顶部（减去一点留白，避免被顶栏遮住）
      var top = $target.offset().top - 80;
      $("html, body").animate({ scrollTop: top }, 500);
    });

    /* ---------- 2) 滚动时自动高亮当前所在区块（滚动监听） ---------- */
    var items = [];
    $("a.smooth").each(function () {
      var id = $(this).attr("href");
      if (id && id.charAt(0) === "#" && $(id).length) {
        items.push({ link: $(this), el: $(id) });
      }
    });

    function onScroll() {
      if (!items.length) return;
      var mark = $(window).scrollTop() + 120;     // 视口上方 120px 处作为判定线
      var current = items[0];
      for (var i = 0; i < items.length; i++) {
        if (items[i].el.offset().top <= mark) current = items[i];
      }
      $("#main-menu li").removeClass("active");
      current.link.parent("li").addClass("active");
    }

    $(window).on("scroll", onScroll);
    onScroll(); // 进入页面时先判定一次
  });
})(jQuery);
