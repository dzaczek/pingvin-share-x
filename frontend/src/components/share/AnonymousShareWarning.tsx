import { Alert } from "@mantine/core";
import { TbAlertTriangle } from "react-icons/tb";
import { FormattedMessage, useIntl } from "react-intl";
import useConfig from "../../hooks/config.hook";
import useTranslate from "../../hooks/useTranslate.hook";
import { getAnonymousWarningConfigKeyForLocale } from "../../utils/anonymousWarningMessage.util";

const AnonymousShareWarning = () => {
  const t = useTranslate();
  const config = useConfig();
  const { locale } = useIntl();

  const overrideKey = getAnonymousWarningConfigKeyForLocale(locale);
  const customMessage = overrideKey ? config.get(overrideKey) : "";

  return (
    <Alert
      mb="lg"
      variant="light"
      color="yellow"
      title={t("share.anonymous-warning.banner.title")}
      icon={<TbAlertTriangle />}
    >
      {customMessage || (
        <FormattedMessage id="share.anonymous-warning.banner.description" />
      )}
    </Alert>
  );
};

export default AnonymousShareWarning;
