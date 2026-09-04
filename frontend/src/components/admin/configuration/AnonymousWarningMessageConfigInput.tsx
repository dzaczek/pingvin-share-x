import {
  Box,
  Group,
  Select,
  Stack,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useState } from "react";
import { FormattedMessage } from "react-intl";
import { AdminConfig, UpdateConfig } from "../../../types/config.type";
import { ANONYMOUS_WARNING_LANGUAGES } from "../../../utils/anonymousWarningMessage.util";

const AnonymousWarningMessageConfigInput = ({
  configVariables,
  updatedConfigVariables,
  updateConfigVariable,
}: {
  configVariables: AdminConfig[];
  updatedConfigVariables: UpdateConfig[];
  updateConfigVariable: (variable: UpdateConfig) => void;
}) => {
  const isMobile = useMediaQuery("(max-width: 560px)");
  const [selectedCode, setSelectedCode] = useState(
    ANONYMOUS_WARNING_LANGUAGES[0].code,
  );

  const selectedLanguage = ANONYMOUS_WARNING_LANGUAGES.find(
    (language) => language.code === selectedCode,
  )!;

  const getEffectiveValue = (key: string): string => {
    const updated = updatedConfigVariables.find((item) => item.key === key);
    if (updated) return String(updated.value);

    const configVariable = configVariables.find((item) => item.key === key);
    return configVariable?.value ?? configVariable?.defaultValue ?? "";
  };

  return (
    <Group position="apart">
      <Stack style={{ maxWidth: isMobile ? "100%" : "40%" }} spacing={0}>
        <Title order={6}>
          <FormattedMessage id="admin.config.share.anonymous-warning-message" />
        </Title>
        <Text color="dimmed" size="sm" mb="xs">
          <FormattedMessage id="admin.config.share.anonymous-warning-message.description" />
        </Text>
      </Stack>
      <Stack></Stack>
      <Box style={{ width: isMobile ? "100%" : "50%" }}>
        <Select
          mb="xs"
          data={ANONYMOUS_WARNING_LANGUAGES.map((language) => ({
            value: language.code,
            label: language.name,
          }))}
          value={selectedCode}
          onChange={(value) => value && setSelectedCode(value)}
        />
        <Textarea
          autosize
          minRows={4}
          value={getEffectiveValue(selectedLanguage.configKey)}
          placeholder={selectedLanguage.builtInMessage}
          onChange={(e) =>
            updateConfigVariable({
              key: selectedLanguage.configKey,
              value: e.target.value,
            })
          }
        />
      </Box>
    </Group>
  );
};

export default AnonymousWarningMessageConfigInput;
