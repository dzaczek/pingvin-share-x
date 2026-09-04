import { ColorSchemeProvider, MantineProvider } from "@mantine/core";
import { ModalsProvider, useModals } from "@mantine/modals";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { ReactElement } from "react";
import { IntlProvider } from "react-intl";
import translations from "../../i18n/translations/en-US";
import showAnonymousDownloadWarningModal from "./showAnonymousDownloadWarningModal";

// _app.tsx nests ConfigContext.Provider *inside* ModalsProvider, so whatever
// Mantine renders for an open modal sits outside the config context's
// subtree. A modal body that reads useConfig() gets the context's empty
// default there and throws "Config variable ... not found" the moment it
// looks up a real key - this crashed the app in production. The shared test
// helper (renderWithProviders) nests them the other way round and would not
// have caught it, so this mirrors the real _app.tsx order on purpose.
const renderWithAppProviderOrder = (ui: ReactElement) =>
  render(
    <IntlProvider locale="en-US" messages={translations}>
      <ColorSchemeProvider
        colorScheme="light"
        toggleColorScheme={() => undefined}
      >
        <MantineProvider theme={{ colorScheme: "light" }}>
          <ModalsProvider>{ui}</ModalsProvider>
        </MantineProvider>
      </ColorSchemeProvider>
    </IntlProvider>,
  );

const Trigger = ({
  onConfirm,
  customMessage,
}: {
  onConfirm: () => void;
  customMessage?: string;
}) => {
  const modals = useModals();
  return (
    <button
      onClick={() =>
        showAnonymousDownloadWarningModal(modals, onConfirm, customMessage)
      }
    >
      open
    </button>
  );
};

describe("showAnonymousDownloadWarningModal", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("shows the caller-supplied message and confirms after the countdown, without needing ConfigContext", () => {
    const onConfirm = jest.fn();
    renderWithAppProviderOrder(
      <Trigger onConfirm={onConfirm} customMessage="Custom override text" />,
    );

    act(() => fireEvent.click(screen.getByText("open")));

    expect(screen.getByText("Custom override text")).toBeInTheDocument();

    const [, downloadButton] = screen.getAllByRole("button");
    expect(downloadButton).toBeDisabled();

    // Each tick's effect schedules the next timeout, so it has to be flushed
    // (one act() per tick) before advancing again - a single 5000ms jump
    // fires the first timer but never sees the ones it schedules.
    for (let i = 0; i < 5; i++) {
      act(() => jest.advanceTimersByTime(1000));
    }

    expect(downloadButton).not.toBeDisabled();
    fireEvent.click(downloadButton);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("falls back to the built-in description when no custom message is given", () => {
    renderWithAppProviderOrder(<Trigger onConfirm={() => {}} />);

    act(() => fireEvent.click(screen.getByText("open")));

    expect(
      screen.getByText(translations["share.modal.anonymous-warning.description"]),
    ).toBeInTheDocument();
  });
});
