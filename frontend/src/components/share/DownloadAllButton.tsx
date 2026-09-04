import { Button } from "@mantine/core";
import { useModals } from "@mantine/modals";
import { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import useConfig from "../../hooks/config.hook";
import useTranslate from "../../hooks/useTranslate.hook";
import shareService from "../../services/share.service";
import { getAnonymousWarningConfigKeyForLocale } from "../../utils/anonymousWarningMessage.util";
import toast from "../../utils/toast.util";
import showAnonymousDownloadWarningModal from "./showAnonymousDownloadWarningModal";

const DownloadAllButton = ({
  shareId,
  recipientId,
  warnAnonymous,
}: {
  shareId: string;
  recipientId?: string;
  warnAnonymous?: boolean;
}) => {
  const [isZipReady, setIsZipReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const modals = useModals();
  const t = useTranslate();
  const config = useConfig();
  const { locale } = useIntl();

  const anonymousWarningOverrideKey =
    getAnonymousWarningConfigKeyForLocale(locale);
  const anonymousWarningMessage = anonymousWarningOverrideKey
    ? config.get(anonymousWarningOverrideKey)
    : "";

  const downloadAll = async () => {
    setIsLoading(true);
    await shareService
      .downloadFile(shareId, "zip", recipientId)
      .then(() => setIsLoading(false));
  };

  useEffect(() => {
    shareService
      .getMetaData(shareId)
      .then((share) => setIsZipReady(share.isZipReady))
      .catch(() => {});

    const timer = setInterval(() => {
      shareService
        .getMetaData(shareId)
        .then((share) => {
          setIsZipReady(share.isZipReady);
          if (share.isZipReady) clearInterval(timer);
        })
        .catch(() => clearInterval(timer));
    }, 5000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <Button
      variant="light"
      color="cyan"
      loading={isLoading}
      onClick={() => {
        if (!isZipReady) {
          toast.error(t("share.notify.download-all-preparing"));
        } else if (warnAnonymous) {
          showAnonymousDownloadWarningModal(
            modals,
            downloadAll,
            anonymousWarningMessage,
          );
        } else {
          downloadAll();
        }
      }}
    >
      <FormattedMessage id="share.button.download-all" />
    </Button>
  );
};

export default DownloadAllButton;
