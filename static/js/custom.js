/* DN云导航站 · interaction layer */
(function ($) {
  "use strict";

  $(function () {
    var STORAGE_KEY = "dnyun-section-state-v1";
    var THEME_KEY = "dnyun-theme-v1";
    var $sections = $(".category-section");

    function readSectionState() {
      try { return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}"); }
      catch (error) { return {}; }
    }

    function writeSectionState() {
      var state = {};
      $sections.each(function () {
        state[$(this).data("section-id")] = $(this).hasClass("is-collapsed");
      });
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
      catch (error) { /* Storage can be unavailable in private mode. */ }
    }

    function setSection($section, collapsed, save) {
      $section.toggleClass("is-collapsed", collapsed);
      $section.find(".category-toggle").first().attr("aria-expanded", String(!collapsed));
      if (save !== false) writeSectionState();
      scheduleMenuRefresh();
    }

    function restoreSections() {
      var state = readSectionState();
      $sections.each(function () {
        var $section = $(this);
        if (state[$section.data("section-id")] === true) setSection($section, true, false);
      });
    }

    restoreSections();

    $(document).on("click", ".category-toggle", function () {
      var $section = $(this).closest(".category-section");
      setSection($section, !$section.hasClass("is-collapsed"));
    });

    $("#expand-all-sections").on("click", function () {
      $sections.each(function () { setSection($(this), false, false); });
      writeSectionState();
    });

    $("#collapse-all-sections").on("click", function () {
      $sections.each(function () { setSection($(this), true, false); });
      writeSectionState();
    });

    function scrollToTarget($target) {
      if (!$target.length) return;
      var $section = $target.closest(".category-section");
      if ($section.hasClass("is-collapsed")) setSection($section, false);
      window.setTimeout(function () {
        $("html, body").stop(true).animate({ scrollTop: Math.max(0, $target.offset().top - 88) }, 420);
      }, 30);
    }

    $("a.smooth").off("click").on("click", function (event) {
      var href = $(this).attr("href");
      if (!href || href.charAt(0) !== "#") return;
      var $target = $(href);
      if (!$target.length) return;

      event.preventDefault();
      $("#main-menu li").removeClass("active");
      $(this).parent("li").addClass("active");
      scrollToTarget($target);

      if ($("#main-menu").hasClass("mobile-is-visible")) {
        $("#main-menu").removeClass("mobile-is-visible");
      }
    });

    var menuItems = [];
    $("a.smooth").each(function () {
      var href = $(this).attr("href");
      if (href && href.charAt(0) === "#" && $(href).length) {
        menuItems.push({ link: $(this), target: $(href) });
      }
    });

    var scrollTicking = false;
    var menuRefreshTimer = null;
    var activeMenuIndex = -1;

    function refreshMenuPositions() {
      for (var i = 0; i < menuItems.length; i += 1) {
        menuItems[i].top = menuItems[i].target.offset().top;
      }
      updateActiveMenu();
    }

    function scheduleMenuRefresh() {
      window.clearTimeout(menuRefreshTimer);
      menuRefreshTimer = window.setTimeout(refreshMenuPositions, 380);
    }

    function updateActiveMenu() {
      scrollTicking = false;
      if (!menuItems.length) return;
      var marker = window.pageYOffset + 130;
      var currentIndex = 0;
      for (var i = 0; i < menuItems.length; i += 1) {
        if (menuItems[i].top <= marker) currentIndex = i;
      }
      if (currentIndex === activeMenuIndex) return;
      activeMenuIndex = currentIndex;
      $("#main-menu li").removeClass("active");
      menuItems[currentIndex].link.parent("li").addClass("active");
    }

    $(window).on("scroll.dnyun", function () {
      if (!scrollTicking) {
        scrollTicking = true;
        window.requestAnimationFrame(updateActiveMenu);
      }
    });
    refreshMenuPositions();

    var resizeTimer = null;
    $(window).on("resize.dnyun", function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(refreshMenuPositions, 140);
    });

    function initialiseTooltips() {
      if (!$.fn.tooltip) return;
      $("body").tooltip({
        selector: "[data-toggle='tooltip']",
        html: true,
        container: "body",
        placement: "bottom",
        viewport: "body",
        delay: { show: 180, hide: 60 }
      });
    }
    initialiseTooltips();

    function reorderSearchEngines() {
      var $group = $(".search-group.group-a");
      var $list = $group.find("ul.search-type");
      var $google = $group.find("#type-google").closest("li");
      var $bing = $group.find("#type-bing1").closest("li");
      var $baidu = $group.find("#type-baidu").closest("li");
      if ($list.length && $google.length && $bing.length && $baidu.length) {
        $list.append($google, $bing, $baidu);
        $group.find("input").prop("checked", false);
        $google.find("input").prop("checked", true).trigger("change");
      }
    }

    function syncSearchTypeLabel() {
      var text = $(".search-group:visible").first().find(".type-text").text().trim();
      if (text) {
        var cleanText = text.replace(/\s+/g, "").replace(/(.)\1+/g, "$1");
        $(".s-type > span").attr("data-label", cleanText).empty();
      }
    }

    reorderSearchEngines();
    syncSearchTypeLabel();
    $(document).on("change", "input[name='type']", syncSearchTypeLabel);
    $(document).on("click", ".s-type-list label", function () {
      window.setTimeout(syncSearchTypeLabel, 10);
    });

    try {
      var savedTheme = window.localStorage.getItem(THEME_KEY);
      if (savedTheme === "dark") $("body").removeClass("white").addClass("black");
      if (savedTheme === "light") $("body").removeClass("black").addClass("white");
    } catch (error) {}

    $(".bright-dark i")
      .toggleClass("fa-sun", $("body").hasClass("black"))
      .toggleClass("fa-moon", !$("body").hasClass("black"));

    $(document).on("click", ".bright-dark", function () {
      try { window.localStorage.setItem(THEME_KEY, $("body").hasClass("black") ? "dark" : "light"); }
      catch (error) {}
    });
  });
})(jQuery);
