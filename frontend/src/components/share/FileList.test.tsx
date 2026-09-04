import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../test/renderWithProviders";
import { Share } from "../../types/share.type";
import FileList from "./FileList";

// Hashing a file reads the whole thing, so the icon that triggers it is for
// admins only. Two things are worth holding still: that it is not there for
// anyone else, and that the address it sends an admin to is the one
// VirusTotal actually answers on. A wrong path there does not fail loudly,
// it just shows a page about nothing.

const getFileSha256 = jest.fn();

jest.mock("../../services/share.service", () => ({
  __esModule: true,
  default: {
    getFileSha256: (...args: unknown[]) => getFileSha256(...args),
    isShareTextFile: () => false,
    doesFileSupportPreview: () => false,
    downloadFile: jest.fn(),
  },
}));

const share = {
  id: "share-id",
  hasPassword: false,
  files: [],
} as unknown as Share;

const files = [{ id: "file-id", name: "report.pdf", size: "1024" }];

const renderList = (isAdmin: boolean) =>
  renderWithProviders(
    <FileList
      files={files as any}
      setShare={() => undefined}
      share={share}
      isLoading={false}
      isAdmin={isAdmin}
    />,
  );

const LABEL =
  "Check this file on VirusTotal by its sha256. The file is not uploaded anywhere, only its hash is looked up, so an unknown file shows as not found.";

beforeEach(() => {
  getFileSha256.mockReset();
  getFileSha256.mockResolvedValue("a".repeat(64));
});

describe("the VirusTotal lookup on a file", () => {
  it("is not offered to someone who is not an admin", () => {
    renderList(false);
    expect(screen.queryByLabelText(LABEL)).not.toBeInTheDocument();
  });

  it("is offered to an admin", () => {
    renderList(true);
    expect(screen.getByLabelText(LABEL)).toBeInTheDocument();
  });

  it("sends the admin to the file's page on VirusTotal", async () => {
    const tab = { location: { href: "" }, close: jest.fn() };
    const open = jest
      .spyOn(window, "open")
      .mockReturnValue(tab as unknown as Window);

    renderList(true);
    fireEvent.click(screen.getByLabelText(LABEL));

    await waitFor(() =>
      expect(tab.location.href).toBe(
        `https://www.virustotal.com/gui/file/${"a".repeat(64)}`,
      ),
    );
    expect(getFileSha256).toHaveBeenCalledWith("share-id", "file-id");

    open.mockRestore();
  });

  // The tab has to be opened on the click itself. Opening it after the hash
  // comes back reads as a popup to the browser and gets blocked, which looks
  // to the admin like the button does nothing.
  it("opens the tab on the click rather than after the request", () => {
    const tab = { location: { href: "" }, close: jest.fn() };
    const open = jest
      .spyOn(window, "open")
      .mockReturnValue(tab as unknown as Window);

    renderList(true);
    fireEvent.click(screen.getByLabelText(LABEL));

    expect(open).toHaveBeenCalled();
    expect(getFileSha256).toHaveBeenCalled();

    open.mockRestore();
  });

  it("closes the tab again when the hash cannot be worked out", async () => {
    getFileSha256.mockRejectedValue(new Error("nope"));
    const tab = { location: { href: "" }, close: jest.fn() };
    const open = jest
      .spyOn(window, "open")
      .mockReturnValue(tab as unknown as Window);

    renderList(true);
    fireEvent.click(screen.getByLabelText(LABEL));

    await waitFor(() => expect(tab.close).toHaveBeenCalled());
    expect(tab.location.href).toBe("");

    open.mockRestore();
  });
});
