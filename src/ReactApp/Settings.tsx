import React from "react";
import {
  DefaultButton,
  Dialog,
  DialogFooter,
  DialogType,
  PrimaryButton,
  Stack,
  TextField,
} from "@fluentui/react";
import { Form, Formik, FormikHelpers } from "formik";
import * as Yup from "yup";

interface SettingsForm {
  url?: string | null;
  username?: string | null;
  password?: string | null;
  userAgent?: string | null;
}

const validationSchema = new Yup.ObjectSchema<SettingsForm>({
  url: Yup.string().required().url(),
  username: Yup.string().required(),
  password: Yup.string().required(),
  userAgent: Yup.string().notRequired(),
});

const getSettingsFromStorage = (): SettingsForm => {
  return {
    url: localStorage.getItem("iptv.url") ?? null,
    username: localStorage.getItem("iptv.username") ?? null,
    password: localStorage.getItem("iptv.password") ?? null,
    userAgent: localStorage.getItem("iptv.userAgent") ?? null,
  };
};

interface ISettings {
  settings: SettingsForm;
  isValid: boolean;
}

const SettingsContext = React.createContext<ISettings>(null);

export const SettingsProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [settings, setSettings] = React.useState(getSettingsFromStorage);
  const [isValid, setIsValid] = React.useState<boolean>(() =>
    validationSchema.isValidSync(settings)
  );

  React.useEffect(() => {
    const handler = () => {
      setSettings(getSettingsFromStorage());
    };
    window.addEventListener("storage", handler, false);
    return () => window.removeEventListener("storage", handler);
  }, []);

  React.useEffect(() => {
    setIsValid(validationSchema.isValidSync(settings));
  }, [settings]);

  const value = React.useMemo<ISettings>(() => {
    return { settings, isValid };
  }, [settings, isValid]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): ISettings => {
  const value = React.useContext(SettingsContext);
  if (!value) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return value;
};

interface ISettingsDialogProps {
  open?: boolean;
  onDismiss?: () => void;
}

export const SettingsDialog: React.FC<ISettingsDialogProps> = ({
  open,
  onDismiss,
}) => {
  const { settings, isValid } = useSettings();

  const onSubmit = React.useCallback((values: SettingsForm, { validateForm }: FormikHelpers<SettingsForm>) => {
    validateForm(values).then(() => {
      for (const [key, value] of Object.entries(values)) {
        localStorage.setItem("iptv." + key, value);
      }
      window.dispatchEvent(new Event("storage"));
    });
  }, []);

  return (
    <Dialog
      hidden={!open}
      onDismiss={isValid ? onDismiss : undefined}
      modalProps={{
        isBlocking: true,
        styles: {
          main: {
            width: "80vw !important",
            maxWidth: "578px !important",
          },
        },
      }}
      dialogContentProps={{
        type: DialogType.close,
        title: "Settings",
      }}
    >
      <Formik
        initialValues={settings}
        onSubmit={onSubmit}
        validationSchema={validationSchema}
        validateOnChange={false}
        validateOnBlur={false}
        validateOnMount={false}
      >
        {({ values, errors, handleChange, handleBlur }) => (
          <Form>
            <Stack tokens={{ childrenGap: 8 }}>
              <TextField
                label="URL"
                name="url"
                value={values.url}
                onChange={handleChange}
                onBlur={handleBlur}
                errorMessage={errors.url}
                required
              />
              <TextField
                type="password"
                label="Username"
                name="username"
                value={values.username}
                onChange={handleChange}
                onBlur={handleBlur}
                errorMessage={errors.username}
                canRevealPassword
                required
              />
              <TextField
                type="password"
                label="Password"
                name="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                errorMessage={errors.password}
                canRevealPassword
                required
              />
              <TextField
                label="User-Agent"
                name="userAgent"
                value={values.userAgent}
                onChange={handleChange}
                onBlur={handleBlur}
                errorMessage={errors.userAgent}
              />
            </Stack>
            <DialogFooter>
              <PrimaryButton text="Save" type="submit" />
              <DefaultButton
                text="Cancel"
                onClick={onDismiss}
                disabled={!isValid}
              />
            </DialogFooter>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};
