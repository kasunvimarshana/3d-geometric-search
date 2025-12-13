/**
 * NavigationManager - Handles the sidebar navigation system
 *
 * Features:
 * - Hierarchical section listing with nested sub-sections
 * - Interactive focus behavior with smooth scrolling
 * - Active state tracking and highlighting
 * - Integration with SectionManager and auto-focus
 * - Event handler consistency with proper cleanup
 *
 * @version 1.8.0
 */

class NavigationManager {
  constructor(eventManager, sectionManager, eventBus) {
    this.eventManager = eventManager;
    this.sectionManager = sectionManager;
    this.eventBus = eventBus;

    // Navigation state
    this.isOpen = false;
    this.activeSection = null;

    // DOM references
    this.navToggle = null;
    this.sidebarNav = null;
    this.navContent = null;
    this.navSections = null;
    this.container = null;

    // Section configuration with hierarchy
    this.sections = [
      {
        id: "upload-section",
        title: "Upload Model",
        icon: "\u2191",
        selector: ".upload-section",
      },
      {
        id: "viewer-section",
        title: "3D Viewer",
        icon: "\u25a0",
        selector: ".viewer-section",
        subsections: [
          {
            id: "advanced-controls",
            title: "Advanced Controls",
            icon: "\u2699",
            selector: "#advanced-controls",
          },
        ],
      },
      {
        id: "library-section",
        title: "Model Library",
        icon: "\u2630",
        selector: ".library-section",
      },
      {
        id: "results-section",
        title: "Search Results",
        icon: "\u2315",
        selector: ".results-section",
      },
    ];

    // Throttled scroll handler for active section tracking
    this.scrollHandler = null;
  }

  /**
   * Initialize the navigation system
   */
  init() {
    try {
      // Get DOM references
      this.navToggle = document.getElementById("navToggle");
      this.sidebarNav = document.getElementById("sidebarNav");
      this.navContent = document.getElementById("navContent");
      this.navSections = document.getElementById("navSections");
      this.container = document.querySelector(".container");

      if (!this.navToggle || !this.sidebarNav || !this.navSections) {
        console.error("Navigation: Required DOM elements not found");
        return false;
      }

      // Build navigation UI
      this.buildNavigationUI();

      // Setup event handlers
      this.setupEventHandlers();

      // Setup scroll tracking
      this.setupScrollTracking();

      // Subscribe to relevant events
      this.subscribeToEvents();

      console.log("NavigationManager initialized successfully");
      return true;
    } catch (error) {
      console.error("Navigation initialization error:", error);
      return false;
    }
  }

  /**
   * Build the navigation UI dynamically
   */
  buildNavigationUI() {
    const fragment = document.createDocumentFragment();

    this.sections.forEach((section) => {
      const listItem = document.createElement("li");
      listItem.className = "nav-section-item";

      if (section.subsections && section.subsections.length > 0) {
        listItem.classList.add("has-subsections");
      }

      // Create main section link
      const link = document.createElement("a");
      link.className = "nav-section-link";
      link.setAttribute("data-section-id", section.id);
      link.setAttribute("role", "button");
      link.setAttribute("tabindex", "0");
      link.textContent = section.title;

      listItem.appendChild(link);

      // Create subsections if they exist
      if (section.subsections && section.subsections.length > 0) {
        const subList = document.createElement("ul");
        subList.className = "nav-subsections";

        section.subsections.forEach((subsection) => {
          const subItem = document.createElement("li");
          subItem.className = "nav-subsection-item";

          const subLink = document.createElement("a");
          subLink.className = "nav-subsection-link";
          subLink.setAttribute("data-section-id", subsection.id);
          subLink.setAttribute("role", "button");
          subLink.setAttribute("tabindex", "0");
          subLink.textContent = subsection.title;

          subItem.appendChild(subLink);
          subList.appendChild(subItem);
        });

        listItem.appendChild(subList);
      }

      fragment.appendChild(listItem);
    });

    this.navSections.appendChild(fragment);
  }

  /**
   * Setup event handlers with proper cleanup
   */
  setupEventHandlers() {
    try {
      // Toggle button handler
      this.eventManager.add(
        this.navToggle,
        "click",
        (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.toggleNavigation();
        },
        { id: "nav-toggle" }
      );

      // Section link click handlers
      const sectionLinks =
        this.navSections.querySelectorAll(".nav-section-link");
      sectionLinks.forEach((link) => {
        this.eventManager.add(
          link,
          "click",
          (e) => {
            e.preventDefault();
            e.stopPropagation();
            const sectionId = link.getAttribute("data-section-id");
            this.handleSectionClick(sectionId);
          },
          { id: `nav-section-${link.getAttribute("data-section-id")}` }
        );

        // Keyboard accessibility
        this.eventManager.add(
          link,
          "keydown",
          (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              const sectionId = link.getAttribute("data-section-id");
              this.handleSectionClick(sectionId);
            }
          },
          { id: `nav-section-key-${link.getAttribute("data-section-id")}` }
        );
      });

      // Subsection link click handlers
      const subsectionLinks = this.navSections.querySelectorAll(
        ".nav-subsection-link"
      );
      subsectionLinks.forEach((link) => {
        this.eventManager.add(
          link,
          "click",
          (e) => {
            e.preventDefault();
            e.stopPropagation();
            const sectionId = link.getAttribute("data-section-id");
            this.handleSubsectionClick(sectionId);
          },
          { id: `nav-subsection-${link.getAttribute("data-section-id")}` }
        );

        // Keyboard accessibility
        this.eventManager.add(
          link,
          "keydown",
          (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              const sectionId = link.getAttribute("data-section-id");
              this.handleSubsectionClick(sectionId);
            }
          },
          { id: `nav-subsection-key-${link.getAttribute("data-section-id")}` }
        );
      });

      // Close on outside click (desktop)
      if (window.innerWidth > 768) {
        this.eventManager.add(
          document,
          "click",
          (e) => {
            if (
              this.isOpen &&
              !this.sidebarNav.contains(e.target) &&
              e.target !== this.navToggle
            ) {
              this.closeNavigation();
            }
          },
          { id: "nav-outside-click" }
        );
      }

      // ESC key to close
      this.eventManager.add(
        document,
        "keydown",
        (e) => {
          if (e.key === "Escape" && this.isOpen) {
            this.closeNavigation();
          }
        },
        { id: "nav-escape-key" }
      );
    } catch (error) {
      console.error("Navigation: Error setting up event handlers:", error);
    }
  }

  /**
   * Setup scroll tracking for active section highlighting
   */
  setupScrollTracking() {
    // Create throttled scroll handler
    this.scrollHandler = this.throttle(() => {
      this.updateActiveSection();
    }, 200);

    this.eventManager.add(window, "scroll", this.scrollHandler, {
      id: "nav-scroll-tracking",
    });
  }

  /**
   * Subscribe to relevant EventBus events
   */
  subscribeToEvents() {
    // Listen for section visibility changes
    this.eventBus.on("section:shown", (data) => {
      if (data && data.sectionId) {
        this.updateActiveSection(data.sectionId);
      }
    });

    // Listen for model loading
    this.eventBus.on("model:loaded", () => {
      // Highlight viewer section when model loads
      this.updateActiveSection("viewer-section");
    });

    // Listen for search results
    this.eventBus.on("search:complete", () => {
      // Highlight results section when search completes
      this.updateActiveSection("results-section");
    });
  }

  /**
   * Handle main section click
   */
  async handleSectionClick(sectionId) {
    try {
      const section = this.findSectionById(sectionId);
      if (!section) {
        console.error("Navigation: Section not found:", sectionId);
        return;
      }

      // Toggle subsections if present
      const listItem = this.navSections
        .querySelector(`[data-section-id="${sectionId}"]`)
        .closest(".nav-section-item");

      if (listItem && listItem.classList.contains("has-subsections")) {
        listItem.classList.toggle("expanded");
      }

      // Show section if managed by SectionManager
      if (this.sectionManager.sections.has(sectionId)) {
        await this.sectionManager.showSection(sectionId);
      }

      // Focus on section with smooth scroll
      await this.focusOnSection(section);

      // Update active state
      this.updateActiveSection(sectionId);

      // Emit event
      this.eventBus.emit("navigation:section-clicked", { sectionId });

      // Close navigation on mobile
      if (window.innerWidth <= 768) {
        this.closeNavigation();
      }
    } catch (error) {
      console.error("Navigation: Error handling section click:", error);
    }
  }

  /**
   * Handle subsection click
   */
  async handleSubsectionClick(subsectionId) {
    try {
      const subsection = this.findSubsectionById(subsectionId);
      if (!subsection) {
        console.error("Navigation: Subsection not found:", subsectionId);
        return;
      }

      // Show parent section first
      const parentSection = this.findParentSection(subsectionId);
      if (parentSection && this.sectionManager.sections.has(parentSection.id)) {
        await this.sectionManager.showSection(parentSection.id);
      }

      // Show subsection if managed by SectionManager
      if (this.sectionManager.sections.has(subsectionId)) {
        await this.sectionManager.showSection(subsectionId);
      }

      // Focus on subsection with smooth scroll
      await this.focusOnSection(subsection);

      // Update active state
      this.updateActiveSection(subsectionId);

      // Emit event
      this.eventBus.emit("navigation:subsection-clicked", { subsectionId });

      // Close navigation on mobile
      if (window.innerWidth <= 768) {
        this.closeNavigation();
      }
    } catch (error) {
      console.error("Navigation: Error handling subsection click:", error);
    }
  }

  /**
   * Focus on a section with smooth scroll and visual feedback
   */
  async focusOnSection(section) {
    try {
      const element = document.querySelector(section.selector);
      if (!element) {
        console.warn(
          "Navigation: Element not found for selector:",
          section.selector
        );
        return;
      }

      // Calculate scroll position with offset for header
      const headerHeight = 80;
      const elementTop =
        element.getBoundingClientRect().top + window.pageYOffset;
      const scrollPosition = elementTop - headerHeight;

      // Smooth scroll to element
      window.scrollTo({
        top: scrollPosition,
        behavior: "smooth",
      });

      // Add visual feedback
      element.classList.add("section-focused");
      setTimeout(() => {
        element.classList.remove("section-focused");
      }, 1500);

      // Ensure section is visible
      if (element.style.display === "none") {
        element.style.display = "";
      }
    } catch (error) {
      console.error("Navigation: Error focusing on section:", error);
    }
  }

  /**
   * Update active section highlighting
   */
  updateActiveSection(sectionId = null) {
    try {
      // If sectionId provided, use it
      if (sectionId) {
        this.activeSection = sectionId;
      } else {
        // Otherwise, detect from scroll position
        this.activeSection = this.detectActiveSection();
      }

      // Update UI
      const allLinks = this.navSections.querySelectorAll(
        ".nav-section-link, .nav-subsection-link"
      );
      allLinks.forEach((link) => {
        link.classList.remove("active");
      });

      if (this.activeSection) {
        const activeLink = this.navSections.querySelector(
          `[data-section-id="${this.activeSection}"]`
        );
        if (activeLink) {
          activeLink.classList.add("active");

          // Expand parent if subsection is active
          const parentItem = activeLink.closest(".has-subsections");
          if (parentItem) {
            parentItem.classList.add("expanded");
          }
        }
      }
    } catch (error) {
      console.error("Navigation: Error updating active section:", error);
    }
  }

  /**
   * Detect active section based on scroll position
   */
  detectActiveSection() {
    try {
      const scrollPosition = window.pageYOffset + 150;
      let activeId = null;

      // Check all sections
      for (const section of this.sections) {
        const element = document.querySelector(section.selector);
        if (element && element.offsetHeight > 0) {
          const top = element.offsetTop;
          const bottom = top + element.offsetHeight;

          if (scrollPosition >= top && scrollPosition < bottom) {
            activeId = section.id;

            // Check subsections
            if (section.subsections) {
              for (const subsection of section.subsections) {
                const subElement = document.querySelector(subsection.selector);
                if (subElement && subElement.offsetHeight > 0) {
                  const subTop = subElement.offsetTop;
                  const subBottom = subTop + subElement.offsetHeight;

                  if (scrollPosition >= subTop && scrollPosition < subBottom) {
                    activeId = subsection.id;
                    break;
                  }
                }
              }
            }
            break;
          }
        }
      }

      return activeId;
    } catch (error) {
      console.error("Navigation: Error detecting active section:", error);
      return null;
    }
  }

  /**
   * Toggle navigation open/closed
   */
  toggleNavigation() {
    if (this.isOpen) {
      this.closeNavigation();
    } else {
      this.openNavigation();
    }
  }

  /**
   * Open navigation
   */
  openNavigation() {
    this.isOpen = true;
    this.sidebarNav.classList.add("open");

    if (window.innerWidth > 768) {
      this.container.classList.add("nav-open");
    }

    this.eventBus.emit("navigation:opened");
  }

  /**
   * Close navigation
   */
  closeNavigation() {
    this.isOpen = false;
    this.sidebarNav.classList.remove("open");
    this.container.classList.remove("nav-open");

    this.eventBus.emit("navigation:closed");
  }

  /**
   * Find section by ID
   */
  findSectionById(sectionId) {
    return this.sections.find((s) => s.id === sectionId);
  }

  /**
   * Find subsection by ID
   */
  findSubsectionById(subsectionId) {
    for (const section of this.sections) {
      if (section.subsections) {
        const subsection = section.subsections.find(
          (s) => s.id === subsectionId
        );
        if (subsection) return subsection;
      }
    }
    return null;
  }

  /**
   * Find parent section for a subsection
   */
  findParentSection(subsectionId) {
    for (const section of this.sections) {
      if (section.subsections) {
        const hasSubsection = section.subsections.some(
          (s) => s.id === subsectionId
        );
        if (hasSubsection) return section;
      }
    }
    return null;
  }

  /**
   * Throttle utility
   */
  throttle(func, wait) {
    let timeout = null;
    let lastRan = 0;

    return function (...args) {
      const now = Date.now();

      if (now - lastRan >= wait) {
        func.apply(this, args);
        lastRan = now;
      } else {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          func.apply(this, args);
          lastRan = Date.now();
        }, wait - (now - lastRan));
      }
    };
  }

  /**
   * Get navigation statistics
   */
  getStats() {
    return {
      isOpen: this.isOpen,
      activeSection: this.activeSection,
      totalSections: this.sections.length,
      totalSubsections: this.sections.reduce(
        (count, s) => count + (s.subsections ? s.subsections.length : 0),
        0
      ),
    };
  }

  /**
   * Cleanup
   */
  destroy() {
    try {
      // Event manager will handle cleanup
      this.scrollHandler = null;
      console.log("NavigationManager destroyed");
    } catch (error) {
      console.error("Navigation: Error during cleanup:", error);
    }
  }
}

// Export to global scope
if (typeof window !== "undefined") {
  window.NavigationManager = NavigationManager;
}
