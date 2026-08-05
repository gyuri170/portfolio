/* ====================================================================
   김규리 (Gyuri Kim) 포트폴리오 - script.js
   ====================================================================
   [초보자 안내]
   이 파일은 아래 5가지 기능만 담당합니다. 기능별로 주석을 나눠뒀으니
   원하는 동작만 찾아서 수정하면 됩니다.
     1) 스크롤 진행률 바
     2) 스크롤 시 네비게이션 배경 변경 + 현재 섹션 메뉴 활성화
     3) 모바일 햄버거 메뉴 열고 닫기
     4) 스크롤하면 나타나는 reveal 애니메이션 (IntersectionObserver)
     5) 통계 숫자 카운트업 애니메이션 + 이메일 복사 버튼 + 맨 위로 버튼
   ==================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  /* ------------------------------------------------------------------
     1) 스크롤 진행률 바
     : 현재 스크롤 위치 / 전체 스크롤 가능 높이 = 퍼센트를 계산해
       상단 바의 width 값으로 반영합니다.
  ------------------------------------------------------------------ */
  const progressBar = document.getElementById("progressBar");

  function updateProgressBar() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = progress + "%";
  }

  /* ------------------------------------------------------------------
     2) 네비게이션 배경 전환 + 현재 스크롤 위치에 맞는 메뉴 활성화
  ------------------------------------------------------------------ */
  const nav = document.getElementById("nav");
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  function updateNavOnScroll() {
    // 40px 이상 스크롤되면 네비게이션에 반투명 배경을 줍니다.
    nav.classList.toggle("is-scrolled", window.scrollY > 40);

    // 현재 화면 중앙에 걸쳐 있는 섹션을 찾아 해당 메뉴에 is-active 클래스를 부여합니다.
    let currentId = "";
    const scanLine = window.scrollY + window.innerHeight * 0.35;

    sections.forEach((section) => {
      if (scanLine >= section.offsetTop) {
        currentId = section.id;
      }
    });

    navLinks.forEach((link) => {
      const isMatch = link.getAttribute("href") === `#${currentId}`;
      link.classList.toggle("is-active", isMatch);
    });
  }

  // 스크롤 이벤트를 하나로 묶어서 처리 (성능을 위해 requestAnimationFrame 사용)
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateProgressBar();
        updateNavOnScroll();
        ticking = false;
      });
      ticking = true;
    }
  });
  updateProgressBar();
  updateNavOnScroll();

  /* ------------------------------------------------------------------
     3) 모바일 햄버거 메뉴
  ------------------------------------------------------------------ */
  const navToggle = document.getElementById("navToggle");
  const navLinksWrap = document.getElementById("navLinks");

  navToggle.addEventListener("click", () => {
    navLinksWrap.classList.toggle("is-open");
  });

  // 메뉴 항목을 클릭하면 자동으로 모바일 메뉴를 닫습니다.
  navLinksWrap.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinksWrap.classList.remove("is-open");
    });
  });

  /* ------------------------------------------------------------------
     4) 스크롤 reveal 애니메이션
     : .reveal 클래스가 붙은 요소가 화면에 10% 이상 보이면
       .is-visible 클래스를 추가해 CSS 트랜지션으로 서서히 나타나게 합니다.
       카드처럼 여러 개가 연달아 있는 요소는 순서대로 약간씩 지연시켜
       계단식으로 등장하도록 delay를 부여합니다.
  ------------------------------------------------------------------ */
  const revealEls = document.querySelectorAll(".reveal");

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          // 같은 그리드/리스트 안에서 인덱스를 찾아 순차적으로 딜레이를 줍니다.
          const siblingIndex = Array.from(el.parentElement.children).indexOf(el);
          el.style.transitionDelay = `${Math.min(siblingIndex, 6) * 70}ms`;
          el.classList.add("is-visible");
          revealObserver.unobserve(el);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
  );

  revealEls.forEach((el) => revealObserver.observe(el));

  /* ------------------------------------------------------------------
     5-1) 통계 숫자 카운트업 애니메이션
     : data-count 값까지 0에서부터 부드럽게 증가시킵니다.
       - data-decimal="true" 이면 소수점 2자리까지 표시 (예: 4.24)
       - data-suffix 값이 있으면 숫자 뒤에 붙여줍니다 (예: "+")
  ------------------------------------------------------------------ */
  const statEls = document.querySelectorAll(".stat-num");

  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const isDecimal = el.dataset.decimal === "true";
    const noCommas = el.dataset.nocommas === "true";
    const suffix = el.dataset.suffix || "";
    const duration = 1400; // ms
    const startTime = performance.now();

    function formatNumber(n) {
      if (isDecimal) return n.toFixed(2);
      const rounded = Math.round(n);
      return noCommas ? String(rounded) : rounded.toLocaleString("en-US");
    }

    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      // ease-out 곡선을 적용해 마지막에 서서히 멈추도록 함
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;

      el.textContent = formatNumber(current) + suffix;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = formatNumber(target) + suffix;
      }
    }
    requestAnimationFrame(tick);
  }

  const statObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          statObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  statEls.forEach((el) => statObserver.observe(el));

  /* ------------------------------------------------------------------
     5-2) 이메일 복사 버튼
  ------------------------------------------------------------------ */
  const copyBtn = document.getElementById("copyEmailBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const email = copyBtn.dataset.email;
      try {
        await navigator.clipboard.writeText(email);
      } catch (err) {
        // 클립보드 API를 지원하지 않는 환경(구형 브라우저 등) 대비 예외 처리
        console.warn("클립보드 복사 실패:", err);
      }
      const original = copyBtn.textContent;
      copyBtn.textContent = "복사 완료!";
      copyBtn.classList.add("is-copied");
      setTimeout(() => {
        copyBtn.textContent = original;
        copyBtn.classList.remove("is-copied");
      }, 1800);
    });
  }

  /* ------------------------------------------------------------------
     5-3) 맨 위로 버튼
  ------------------------------------------------------------------ */
  const toTopBtn = document.getElementById("toTopBtn");
  if (toTopBtn) {
    toTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
});
