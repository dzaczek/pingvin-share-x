import { ColorSchemeProvider, MantineProvider } from "@mantine/core";
import { ModalsProvider, useModals } from "@mantine/modals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import translations from "../../i18n/translations/en-US";
import { MyShare } from "../../types/share.type";
import showShareInformationsModal from "./showShareInformationsModal";

// The two lookup links next to an address in the access log are the reason
// this file exists. Both are URLs on someone else's site, so the shape of
// them is worth pinning down: a typo there fails quietly, as a link that
// takes an admin to a page about nothing.

const getAccessLogs = jest.fn();

jest.mock("../../services/share.service", () => ({
  __esModule: true,
  default: {
    getAccessLogs: (...args: unknown[]) => getAccessLogs(...args),
  },
}));

const share = {
  id: "share-id",
  name: "a share",
  expiration: new Date("2999-01-01"),
  createdAt: new Date("2020-01-01"),
  views: 0,
  recipients: [],
  security: { passwordProtected: false, restrictToRecipients: false },
  scanStatus: "CLEAN",
  files: [],
  size: 0,
  description: "",
} as unknown as MyShare;

const Trigger = () => {
  const modals = useModals();
  return (
    <button
      onClick={() =>
        showShareInformationsModal(
          modals,
          share,
          1000,
          "http://localhost:3000",
          "http://localhost:3000",
          undefined,
          undefined,
          false,
          true,
        )
      }
    >
      open
    </button>
  );
};

const renderModal = () =>
  render(
    <IntlProvider locale="en-US" messages={translations}>
      <ColorSchemeProvider
        colorScheme="light"
        toggleColorScheme={() => undefined}
      >
        <MantineProvider theme={{ colorScheme: "light" }}>
          <ModalsProvider>
            <Trigger />
          </ModalsProvider>
        </MantineProvider>
      </ColorSchemeProvider>
    </IntlProvider>,
  );

beforeEach(() => {
  getAccessLogs.mockReset();
  getAccessLogs.mockResolvedValue({
    totalEvents: 1,
    entries: [
      {
        event: "VIEWED",
        ip: "91.132.8.1",
        count: 1,
        firstSeen: "2026-01-01T00:00:00.000Z",
        lastSeen: "2026-01-01T00:00:00.000Z",
      },
    ],
  });
});

describe("showShareInformationsModal access log", () => {
  it("points the two lookup links at the address that was logged", async () => {
    renderModal();
    fireEvent.click(screen.getByText("open"));

    const ipinfo = await screen.findByRole("link", {
      name: "Look this IP up on ipinfo.io",
    });
    expect(ipinfo).toHaveAttribute("href", "https://ipinfo.io/91.132.8.1");

    const virusTotal = screen.getByRole("link", {
      name: "Check this IP on VirusTotal",
    });
    expect(virusTotal).toHaveAttribute(
      "href",
      "https://www.virustotal.com/gui/ip-address/91.132.8.1",
    );
  });

  it("opens both of them in a new tab without leaking the referrer", async () => {
    renderModal();
    fireEvent.click(screen.getByText("open"));

    await waitFor(() =>
      expect(screen.getAllByRole("link")).not.toHaveLength(0),
    );

    for (const name of [
      "Look this IP up on ipinfo.io",
      "Check this IP on VirusTotal",
    ]) {
      const link = screen.getByRole("link", { name });
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("still shows the address itself, not only the icons", async () => {
    renderModal();
    fireEvent.click(screen.getByText("open"));

    expect(await screen.findByText("91.132.8.1")).toBeInTheDocument();
  });
});
