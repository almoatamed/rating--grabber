import type { JSX, PropsWithChildren } from "react";
import "./index.css";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type ThemeColors = {
  primary: string;
  onPrimary: string;
  surface: string;
  onSurface: string;

  background: string;
  onBackground: string;

  error: string;
  onError: string;

  warning: string;
  onWarning: string;

  disabled: string;
  onDisable: string;

  success: string;
  onSuccess: string;

  secondary: string;
};

export const lightTheme: ThemeColors = {
  primary: "#4F46E5", // elegant indigo
  onPrimary: "#FFFFFF",

  surface: "#FFFFFF",
  onSurface: "#111827",

  background: "#F7F8FC",
  onBackground: "#0F172A",

  error: "#DC2626",
  onError: "#FFFFFF",

  warning: "#F59E0B",
  onWarning: "#111827",

  disabled: "#E5E7EB",
  onDisable: "#9CA3AF",

  success: "#10B981",
  onSuccess: "#FFFFFF",

  secondary: "#7C3AED",
};

export const darkTheme: ThemeColors = {
  primary: "#8B5CF6", // rich violet
  onPrimary: "#FFFFFF",

  surface: "#111827",
  onSurface: "#E5E7EB",

  background: "#0B1020",
  onBackground: "#F8FAFC",

  error: "#F87171",
  onError: "#1F2937",

  warning: "#FBBF24",
  onWarning: "#111827",

  disabled: "#243041",
  onDisable: "#64748B",

  success: "#34D399",
  onSuccess: "#052E21",

  secondary: "#38BDF8",
};

type Theme = {
  themeColors: ThemeColors;
  themeName: ThemeName;
  isDark: boolean;
};

const themeContext = React.createContext<null | Theme>(null);
const useTheme = () => {
  return useContext(themeContext);
};

const THEME_STORAGE_KEY = "ANIWATCHTV-EXTENSIONS:THEME";
type ThemeName = "dark" | "light" | "system";

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}
const defaultBoxShadow = "1px 1px 15px 1px #00000022";

const ThemeProvider = (props: PropsWithChildren) => {
  const existingTheme = useTheme();
  const [themeName, setThemeName] = useState<ThemeName>("system");
  const loadThemeFromLocalStorage = useCallback(() => {
    const themeName = localStorage.getItem(
      THEME_STORAGE_KEY,
    ) as ThemeName | null;
    if (!themeName) {
      return;
    }
    if (!["dark", "light", "system"].includes(themeName)) {
      localStorage.removeItem(THEME_STORAGE_KEY);
      return;
    }
    setThemeName(themeName);
  }, []);

  useEffect(() => {
    loadThemeFromLocalStorage();
  }, []);

  const theme = useMemo((): Theme => {
    if (themeName == "dark") {
      return { themeColors: darkTheme, themeName, isDark: true };
    }
    if (themeName == "light") {
      return { themeColors: lightTheme, isDark: false, themeName };
    }
    const systemThemeName = getSystemTheme();
    if (systemThemeName == "dark") {
      return { themeColors: darkTheme, themeName, isDark: true };
    }
    return { themeColors: lightTheme, isDark: false, themeName };
  }, [themeName]);

  if (existingTheme) {
    throw new Error("you already used theme provider up the stack");
  }

  return (
    <themeContext.Provider value={theme}>
      {props.children}
    </themeContext.Provider>
  );
};

const ThemedView = (
  props: JSX.IntrinsicElements["div"] & {
    disabled?: boolean;
  },
) => {
  const theme = useTheme();

  return (
    <div
      {...props}
      style={{
        display: "flex",
        flexDirection: "column",
        fontSize: "14px",

        cursor: props.onClick && !props.disabled ? "pointer" : undefined,

        ...props.style,
      }}
      onClick={props.onClick && !props.disabled ? props.onClick : undefined}
    >
      {props.children}
    </div>
  );
};

const Card = (
  props: JSX.IntrinsicElements["div"] & {
    disabled?: boolean;
  },
) => {
  const theme = useTheme();
  return (
    <ThemedView
      {...props}
      style={{
        backgroundColor: theme?.themeColors.surface,
        color: `${theme?.themeColors.onSuccess} !important`,
        boxShadow: defaultBoxShadow,
        padding: "22px",
        gap: "22px",
        borderRadius: "12px",

        ...props.style,
      }}
    ></ThemedView>
  );
};

const loadRatings = async (setLoading: (value: boolean) => void) => {
  setLoading(true);
  try {
    const ratings = document.querySelectorAll(
      ".flw-item.flw-item-big:has(.film-poster):has(.film-details)",
    );

    ratings.forEach((item) => {
      if (item.classList.contains(".film-details")) {
        console.log("anime item details", item);
      }
    });
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};

const Main = () => {
  const theme = useTheme();

  const [loadingRatings, setLoadingRatings] = useState(false);
  const [notAniwatch, setNotAniwatch] = useState(true);

  useEffect(() => {
    if (location.hostname != "aniwatchtv.to") {
      console.log("not aniwatch", location.hostname);
      return;
    }
    setNotAniwatch(false);
    loadRatings((v) => {
      setLoadingRatings(v);
    });
  }, []);

  return (
    <>
      <Card
        style={{
          background: theme?.themeColors.background,
          color: theme?.themeColors.onBackground,
          gap: "22px",
          maxWidth: "450px",
          maxHeight: "600px",
          width: "100%",
          height: "100%",
          alignItems: "center",
          padding: "22px",
          boxShadow: defaultBoxShadow,
          justifyContent: "center",
        }}
      >
        <ThemedView>Aniwatch Tv Tools</ThemedView>

        {notAniwatch ? (
          <>
            <Card>
              <ThemedView>
                This is not aniwatch visit{" "}
                <a href="https://aniwatchtv.to" target="_blank">
                  aniwatch
                </a>
              </ThemedView>
            </Card>
          </>
        ) : (
          <>
            <Card>
              {loadingRatings && (
                <>
                  <ThemedView>Loading Ratings....</ThemedView>
                </>
              )}
            </Card>
          </>
        )}
      </Card>
    </>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <Main />
    </ThemeProvider>
  );
}

export default App;
