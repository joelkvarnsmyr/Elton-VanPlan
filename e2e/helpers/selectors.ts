/**
 * Centralized selectors for E2E tests
 * This makes tests more maintainable and easier to update
 */

export const selectors = {
  // Navigation & Header
  header: {
    usersButton: 'button[title="Team & Medlemmar"]',
    settingsButton: '.w-6.h-6.rounded-full.bg-teal-100',
    magicImportButton: 'button:has-text("Magic Import")',
  },

  // ProjectMembers Modal
  projectMembers: {
    modal: '.fixed.inset-0.bg-black\\/50',
    modalContent: '.bg-white.dark\\:bg-nordic-dark-surface',
    title: 'h2:has-text("Team & Medlemmar")',
    closeButton: 'button:has(svg):near(h2:has-text("Team & Medlemmar"))',

    // Owner section
    ownerSection: 'text=Ägare',
    ownerEmail: '.bg-amber-50',

    // Members section
    membersSection: 'text=Medlemmar',
    membersList: 'div:has-text("Medlemmar") + div',
    removeMemberButton: 'button:has-text("UserX")',

    // Invites section
    invitesSection: 'text=Väntande Inbjudningar',
    invitesList: 'div:has-text("Väntande Inbjudningar") + div',
    cancelInviteButton: 'button:has(svg):near(text="Väntar på svar")',

    // Invite form
    inviteForm: {
      emailInput: 'input[type="email"][placeholder="epost@exempel.se"]',
      submitButton: 'button:has-text("Bjud in")',
      errorMessage: 'p.text-rose-500',
    },
  },

  // ProjectSelector (Invitations)
  projectSelector: {
    invitationsSection: 'text=Inbjudningar',
    invitationCard: '.border-teal-500',
    acceptButton: 'button:has-text("Gå med")',
    declineButton: 'button:has(svg):near(button:has-text("Gå med"))',
  },

  // Auth
  auth: {
    loginForm: 'form',
    emailInput: 'input[type="email"]',
    passwordInput: 'input[type="password"]',
    loginButton: 'button:has-text("Logga in")',
    registerButton: 'button:has-text("Skapa konto")',
  },

  // Projects
  projects: {
    projectCard: '.bg-white.rounded-\\[32px\\]',
    projectName: 'h3.font-serif',
    teamBadge: 'text=Team',
    demoBadge: 'text=Demo',
  },

  // Navigation
  nav: {
    eltonAI: '[data-testid="nav-elton-ai"]',
    dashboard: '[data-testid="nav-översikt"]',
    tasks: '[data-testid="nav-att-göra"]',
    shopping: '[data-testid="nav-handla"]',
    specs: '[data-testid="nav-verkstad"]',
  },

  // AIAssistant / Chat
  chat: {
    ringUppButton: '[data-testid="ring-upp-button"]',
    textInput: 'textarea[placeholder*="meddelande"]',
  },

  // LiveElton (Voice/Video Chat)
  liveElton: {
    container: '[data-testid="live-elton-container"]',
    statusMessage: '[data-testid="status-message"]',
    diagnosticToggle: '[data-testid="diagnostic-toggle"]',
    videoToggle: '[data-testid="video-toggle"]',
    micToggle: '[data-testid="mic-toggle"]',
    hangUpButton: '[data-testid="hang-up-button"]',
    settingsButton: '[data-testid="settings-button"]',
  },
};

/**
 * Helper to get modal by checking if it's visible
 */
export const isModalVisible = async (page: any) => {
  return await page.locator(selectors.projectMembers.modal).isVisible();
};

/**
 * Helper to wait for modal to open
 */
export const waitForModal = async (page: any) => {
  await page.locator(selectors.projectMembers.modal).waitFor({ state: 'visible' });
};

/**
 * Helper to close modal
 */
export const closeModal = async (page: any) => {
  await page.locator(selectors.projectMembers.closeButton).click();
  await page.locator(selectors.projectMembers.modal).waitFor({ state: 'hidden' });
};
