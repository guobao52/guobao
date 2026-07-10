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


    /* ---------- 3) 悬停浮层：保留所有 tooltip，统一置顶，不被卡片遮挡 ----------
       主题 nav.js 给所有卡片都初始化了 Bootstrap tooltip，
       普通卡片 tooltip=文字介绍、二维码卡片 tooltip=<img>（二维码图）。
       需求：悬停弹出的文字/二维码都要"置顶显示"，不被旁边卡片盖住。
       做法：先销毁主题默认初始化（它默认 z-index 不够、可能挂错容器），
       再统一重新初始化——html:true 让图片/文字都正确渲染，
       container:'body' + 极高 z-index 确保浮层挂在 body 下、浮在最上层。 */
    function fixTooltips() {
      if (!window.jQuery || !$.fn.tooltip) return;
      // 销毁主题已初始化的 tooltip（保险：try-catch）
      try { $('[data-toggle="tooltip"]').tooltip('destroy'); } catch (e) {}

      // 重新初始化全部卡片 tooltip：挂到 body、层级最高、文字与图片都渲染
      $('[data-toggle="tooltip"]').tooltip({
        html: true,
        container: 'body',
        placement: 'bottom',
        viewport: 'body'
      });
    }
    fixTooltips();                 // DOM ready 后先执行一次
    $(window).on('load', fixTooltips); // 等图片/异步资源完成后再保险执行一次


    /* ---------- 4) 搜索“常用”组排序：Google → Bing → 百度 ----------
       不动主题 search.html，直接用 JS 重排“常用”组的引擎顺序，
       并把 Google 设为默认选中。 */
    function reorderSearch() {
      var $groupA = $('.search-group.group-a');
      if (!$groupA.length) return;
      var $g = $groupA.find('#type-google').closest('li');
      var $b = $groupA.find('#type-bing1').closest('li');
      var $a = $groupA.find('#type-baidu').closest('li');
      if ($g.length && $b.length && $a.length) {
        var $ul = $groupA.find('ul.search-type');
        $ul.append($g).append($b).append($a);     // 重排：Google → Bing → 百度
        $a.find('input').prop('checked', false);  // 取消百度默认
        $g.find('input').prop('checked', true);   // Google 默认选中
      }
    }
    reorderSearch();                 // DOM ready 后执行
    $(window).on('load', reorderSearch); // 保险再执行一次


    /* ---------- 5) 搜索类型切换按钮显示当前分类名 ----------
       左侧 .s-type > span 原本为空，导致显示成空白方块。
       这里把它同步为当前激活分组的 .type-text 文字（如“常用”）。 */
    function syncSearchTypeLabel() {
      var $active = $('.search-group').filter(function () {
        return $(this).css('display') !== 'none';
      }).first();
      var text = $active.find('.type-text').text().trim();
      if (text) $('.s-type > span').text(text);
    }
    syncSearchTypeLabel();
    $(document).on('change', 'input[name="type"]', syncSearchTypeLabel);
    $(document).on('click', '.s-type-list label', function () {
      setTimeout(syncSearchTypeLabel, 10); // 等主题 JS 切换完 display 再读取
    });


  });
})(jQuery);
