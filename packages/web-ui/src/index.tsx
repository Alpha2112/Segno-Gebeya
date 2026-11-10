import React, { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { ApiError, createClient } from "@segno/api-client";
import type {
  ApplicationList,
  ApplicationResponse,
  Challenge,
  Decision,
  DeviceSession,
  IdentityResponse,
  Locale,
  MerchantApplication,
  User,
} from "@segno/contracts";
import { localizeError, translate, type MessageKey } from "@segno/localization";
import "@segno/design-tokens/styles.css";
import { AddressBook, PasswordChange, ProfilePhoto } from "./AccountExtras";

type Screen =
  | "login"
  | "register"
  | "recover"
  | "requestVerify"
  | "verify"
  | "reset"
  | "home"
  | "profile"
  | "application"
  | "sessions"
  | "account"
  | "mfa"
  | "queue"
  | "review"
  | "mode";
const editable = (a: MerchantApplication) =>
  ["draft", "information_needed"].includes(a.status);
function values(form: HTMLFormElement) {
  return Object.fromEntries(new FormData(form).entries()) as Record<
    string,
    string
  >;
}
function Brand() {
  return (
    <div className="brand">
      <span className="mark" aria-hidden="true">
        s
      </span>
      Segno Gebeya
    </div>
  );
}
export function Workspace({ area }: { area: "merchant" | "admin" }) {
  const [locale, setLocale] = useState<Locale>(() =>
    localStorage.getItem("segno.locale") === "am" ? "am" : "en",
  );
  const [theme, setTheme] = useState(
    () => localStorage.getItem("segno.theme") ?? "light",
  );
  const [user, setUser] = useState<User | null>(null),
    [screen, setScreen] = useState<Screen>("login"),
    [busy, setBusy] = useState(false),
    [starting, setStarting] = useState(true);
  const [error, setError] = useState<ApiError | null>(null),
    [success, setSuccess] = useState(""),
    [offline, setOffline] = useState(!navigator.onLine);
  const [challenge, setChallenge] = useState<Challenge | null>(null),
    [purpose, setPurpose] = useState<"verify" | "recover">("verify"),
    [identifier, setIdentifier] = useState(""),
    [resetToken, setResetToken] = useState(""),
    [cooldown, setCooldown] = useState(0);
  const [registrationPassword, setRegistrationPassword] = useState("");
  const [apps, setApps] = useState<MerchantApplication[]>([]),
    [selected, setSelected] = useState<MerchantApplication | null>(null),
    [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [mfa, setMfa] = useState<{
      secret: string;
      uri: string;
      qr?: string;
    } | null>(null),
    [recovery, setRecovery] = useState<string[] | null>(null),
    [decision, setDecision] = useState<Decision | null>(null);
  const [filter, setFilter] = useState(""),
    [search, setSearch] = useState(""),
    [page, setPage] = useState(1),
    [lastPage, setLastPage] = useState(1),
    [store, setStore] = useState<{ id: number; name: string } | null>(null);
  const dialog = useRef<HTMLDialogElement>(null),
    errorBox = useRef<HTMLDivElement>(null);
  const t = useCallback((key: MessageKey) => translate(locale, key), [locale]);
  const clientRef = useRef<ReturnType<typeof createClient> | null>(null);
  const clear = useCallback(() => {
    clientRef.current?.invalidate();
    setUser(null);
    setApps([]);
    setSelected(null);
    setSessions([]);
    setMfa(null);
    setRecovery(null);
    setDecision(null);
    setStore(null);
    setChallenge(null);
    setResetToken("");
    setRegistrationPassword("");
    setScreen("login");
  }, []);
  const [api] = useState(() =>
    createClient({ web: true, onUnauthorized: clear }),
  );
  clientRef.current = api;
  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    setSuccess("");
    try {
      await fn();
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) setStore(null);
      setError(
        e instanceof ApiError
          ? e
          : new ApiError(0, {}, "The request could not be completed."),
      );
    } finally {
      setBusy(false);
    }
  };
  const go = (next: Screen) => {
    if (["login", "register", "recover", "requestVerify"].includes(next))
      setRegistrationPassword("");
    setScreen(next);
    setError(null);
    setSuccess("");
  };
  const signedIn = (data: IdentityResponse) => {
    setRegistrationPassword("");
    setUser(data.user);
    setLocale(data.user.locale);
    go(
      area === "admin" && !data.admin_verified
        ? "mfa"
        : area === "admin"
          ? "queue"
          : "home",
    );
  };
  useEffect(() => {
    api
      .request<IdentityResponse>("/me")
      .then(signedIn)
      .catch(() => {})
      .finally(() => setStarting(false));
  }, []); // Initial session restoration only.
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("segno.locale", locale);
    localStorage.setItem("segno.theme", theme);
  }, [locale, theme]);
  useEffect(() => {
    const on = () => setOffline(!navigator.onLine);
    window.addEventListener("online", on);
    window.addEventListener("offline", on);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", on);
    };
  }, []);
  useEffect(() => {
    if (error) errorBox.current?.focus();
  }, [error]);
  useEffect(() => {
    if (!cooldown) return;
    const timer = setTimeout(() => setCooldown((v) => v - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);
  useEffect(() => {
    if (decision) dialog.current?.showModal();
    else dialog.current?.close();
  }, [decision]);
  const loadApps = async () => {
    const data = await api.request<ApplicationList>(
      area === "admin"
        ? "/admin/applications?" +
            new URLSearchParams({ search, status: filter, page: String(page) })
        : "/merchant/applications",
    );
    setApps(data.applications);
    setLastPage(data.last_page ?? 1);
    return data;
  };
  useEffect(() => {
    if (user && (screen === "application" || screen === "queue"))
      void run(async () => {
        await loadApps();
      });
    if (user && screen === "sessions")
      void run(async () =>
        setSessions(
          (await api.request<{ sessions: DeviceSession[] }>("/sessions"))
            .sessions,
        ),
      );
  }, [screen, page]); // Fetch on navigation; filters have an explicit apply action.
  const field = (
    label: MessageKey,
    name: string,
    props: React.InputHTMLAttributes<HTMLInputElement> = {},
  ) => (
    <label>
      {t(label)}
      <input
        aria-label={t(label)}
        name={name}
        required
        aria-invalid={!!error?.fields[name]}
        aria-describedby={error?.fields[name] ? name + "-error" : undefined}
        {...props}
      />
      {error?.fields[name] && (
        <span id={name + "-error"} className="field-error">
          {error.fields[name]
            .map((value) => localizeError(locale, value))
            .join(" ")}
        </span>
      )}
    </label>
  );
  const password = (name = "password", confirm = false) => (
    <Password
      label={t(confirm ? "confirmPassword" : "password")}
      name={name}
      show={t("showPassword")}
      hide={t("hidePassword")}
      min={screen === "login" || screen === "account" ? undefined : 12}
      help={
        screen === "login" || screen === "account"
          ? undefined
          : t("passwordHelp")
      }
    />
  );
  const submit =
    (fn: (data: Record<string, string>) => Promise<void>) =>
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const data = values(e.currentTarget);
      void run(() => fn(data));
    };
  const refreshUser = async () => {
    const data = await api.request<IdentityResponse>("/me");
    setUser(data.user);
    return data.user;
  };
  const updateApplication = (data: ApplicationResponse) => {
    setSelected(data.application);
    setApps((a) =>
      a.map((x) => (x.id === data.application.id ? data.application : x)),
    );
    setSuccess(t("success"));
  };
  const authContent = () => {
    if (screen === "verify")
      return (
        <>
          <h1>{t("verify")}</h1>
          <p className="muted">{t("verifyHelp")}</p>
          <p>{identifier}</p>
          {challenge?.delivery === "development_capture" && (
            <p className="notice">{t("capture")}</p>
          )}
          <form
            onSubmit={submit(async (d) => {
              const data = await api.request<
                IdentityResponse & { reset_token?: string }
              >("/auth/verify", "POST", {
                ...d,
                purpose,
                challenge_id: challenge?.challenge_id,
                password: registrationPassword || d.password,
                password_confirmation:
                  registrationPassword || d.password_confirmation,
              });
              if (purpose === "recover") {
                setResetToken(data.reset_token!);
                go("reset");
              } else signedIn(data);
            })}
          >
            {field("code", "code", {
              inputMode: "numeric",
              pattern: "[0-9]{6}",
              maxLength: 6,
              autoComplete: "one-time-code",
            })}
            {purpose === "verify" && !registrationPassword && (
              <>
                {password()}
                {password("password_confirmation", true)}
              </>
            )}
            <button className="primary" disabled={busy || offline}>
              {t(busy ? "busy" : "verify")}
            </button>
          </form>
          <button
            className="link"
            disabled={busy || cooldown > 0 || offline}
            onClick={() =>
              void run(async () => {
                setChallenge(
                  await api.request<Challenge>("/auth/challenges", "POST", {
                    identifier,
                    purpose,
                    client: "web",
                  }),
                );
                setCooldown(60);
              })
            }
          >
            {t("resend")}
            {cooldown > 0 ? " (" + cooldown + ")" : ""}
          </button>
          <button className="link" onClick={() => go("login")}>
            {t("back")}
          </button>
        </>
      );
    if (screen === "reset")
      return (
        <>
          <h1>{t("reset")}</h1>
          <form
            onSubmit={submit(async (d) => {
              await api.request("/auth/reset-password", "POST", {
                ...d,
                challenge_id: challenge?.challenge_id,
                token: resetToken,
              });
              setResetToken("");
              go("login");
              setSuccess(t("success"));
            })}
          >
            {password()}
            {password("password_confirmation", true)}
            <button className="primary" disabled={busy || offline}>
              {t("reset")}
            </button>
          </form>
        </>
      );
    if (screen === "mfa")
      return (
        <>
          <h1>{t("mfa")}</h1>
          <p>{t("mfaHelp")}</p>
          {recovery ? (
            <>
              <p>{t("recoveryHelp")}</p>
              <div className="secret">
                {recovery.map((c) => (
                  <div key={c}>{c}</div>
                ))}
              </div>
              <button
                className="primary"
                onClick={() => {
                  setRecovery(null);
                  setMfa(null);
                  go("queue");
                }}
              >
                {t("done")}
              </button>
            </>
          ) : (
            <>
              {!user?.mfa_enrolled && !mfa && (
                <button
                  onClick={() =>
                    void run(async () => {
                      const data = await api.request<{
                        secret: string;
                        uri: string;
                      }>("/admin/mfa/enroll", "POST");
                      setMfa({ ...data, qr: await QRCode.toDataURL(data.uri) });
                    })
                  }
                >
                  {t("enroll")}
                </button>
              )}
              {mfa && (
                <>
                  <img className="qr" src={mfa.qr} alt={t("enroll")} />
                  <p>{t("mfaSecret")}</p>
                  <p className="secret">{mfa.secret}</p>
                </>
              )}
              <form
                onSubmit={submit(async (d) => {
                  const data = await api.request<{
                    recovery_codes: string[] | null;
                  }>("/admin/mfa/verify", "POST", d);
                  setMfa(null);
                  if (data.recovery_codes) setRecovery(data.recovery_codes);
                  else go("queue");
                })}
              >
                {field("code", "code", {
                  required: false,
                  inputMode: "numeric",
                  pattern: "[0-9]{6}",
                  autoComplete: "one-time-code",
                })}
                {field("recoveryCode", "recovery_code", {
                  required: false,
                  autoComplete: "off",
                })}
                <button className="primary" disabled={busy || offline}>
                  {t("verify")}
                </button>
              </form>
            </>
          )}
        </>
      );
    const auth =
      screen === "register"
        ? "register"
        : screen === "requestVerify"
          ? "resend"
          : screen === "recover"
            ? "recover"
            : "signIn";
    return (
      <>
        <div className="eyebrow">
          {t(area === "admin" ? "admin" : "merchant")}
        </div>
        <h1>{t(auth)}</h1>
        <p className="muted">{t("intro")}</p>
        <form
          onSubmit={submit(async (d) => {
            setIdentifier(d.identifier);
            if (screen === "login") {
              signedIn(
                await api.request<IdentityResponse>("/auth/login", "POST", {
                  ...d,
                  client: "web",
                  area,
                }),
              );
            } else {
              setRegistrationPassword(screen === "register" ? d.password : "");
              setPurpose(screen === "recover" ? "recover" : "verify");
              setChallenge(
                await api.request<Challenge>(
                  screen === "register" ? "/auth/register" : "/auth/challenges",
                  "POST",
                  {
                    ...d,
                    locale,
                    client: "web",
                    purpose: screen === "recover" ? "recover" : "verify",
                  },
                ),
              );
              setCooldown(60);
              go("verify");
            }
          })}
        >
          {field("identifier", "identifier", {
            autoComplete: "username",
            defaultValue: identifier,
          })}
          {["login", "register"].includes(screen) && password()}
          {screen === "register" && (
            <>
              {password("password_confirmation", true)}
              <details className="notice">
                <summary>{t("noticeTitle")}</summary>
                <p>{t("pilotNotice")}</p>
              </details>
              <label className="check">
                <input name="terms" type="checkbox" value="1" required />
                {t("terms")}
              </label>
            </>
          )}
          <button className="primary" disabled={busy || offline}>
            {t(busy ? "busy" : auth)}
          </button>
        </form>
        <div className="row">
          {screen !== "login" && (
            <button className="link" onClick={() => go("login")}>
              {t("signIn")}
            </button>
          )}
          {screen === "login" && (
            <>
              <button className="link" onClick={() => go("recover")}>
                {t("recover")}
              </button>
              {area === "merchant" && (
                <button className="link" onClick={() => go("register")}>
                  {t("register")}
                </button>
              )}
              <button
                className="link"
                onClick={() => {
                  setPurpose("verify");
                  go("requestVerify");
                }}
              >
                {t("resend")}
              </button>
            </>
          )}
        </div>
      </>
    );
  };
  const applicationForm = (a: MerchantApplication | null) => (
    <form
      key={a?.id ?? "new"}
      onSubmit={submit(async (d) => {
        const data = await api.request<ApplicationResponse>(
          "/merchant/applications" + (a ? "/" + a.id : ""),
          a ? "PATCH" : "POST",
          { ...d, revision: a?.revision },
        );
        setSelected(data.application);
        await loadApps();
        setSuccess(t("success"));
      })}
    >
      {field("storeName", "store_name", {
        defaultValue: a?.store_name,
        maxLength: 120,
      })}
      <label>
        {t("businessType")}
        <select
          aria-label={t("businessType")}
          name="business_type"
          defaultValue={a?.business_type ?? "individual"}
        >
          <option value="individual">{t("individual")}</option>
          <option value="company">{t("company")}</option>
        </select>
      </label>
      {field("representative", "representative", {
        defaultValue: a?.representative ?? user?.name,
        maxLength: 120,
      })}
      <button className="primary" disabled={busy || offline}>
        {t("saveDraft")}
      </button>
    </form>
  );
  const content = () => {
    if (screen === "home")
      return (
        <>
          <div className="page-head">
            <span className="pill">{t(store ? "merchant" : "customer")}</span>
            <h1>{t(store ? "merchantHome" : "customerHome")}</h1>
            <p>{user?.name || user?.email || user?.phone}</p>
          </div>
          <div className="grid">
            <section className="card">
              <h2>{t("profile")}</h2>
              <p>{t("intro")}</p>
              <button onClick={() => go("profile")}>{t("profile")}</button>
            </section>
            <section className="card">
              <h2>{store?.name ?? t("application")}</h2>
              <p>{store ? t("scope") : t("noMerchant")}</p>
              <button onClick={() => go(store ? "mode" : "application")}>
                {t(store ? "mode" : "application")}
              </button>
            </section>
          </div>
          <p className="notice" style={{ marginTop: 24 }}>
            {t("scope")}
          </p>
        </>
      );
    if (screen === "profile")
      return (
        <section className="card measure">
          <h1>{t("profile")}</h1>
          {user && (
            <ProfilePhoto
              api={api}
              run={run}
              t={t}
              busy={busy}
              offline={offline}
              user={user}
              setUser={setUser}
            />
          )}
          <p className="notice">{t("country")}: Ethiopia · ET</p>
          <form
            onSubmit={submit(async (d) => {
              const result = await api.request<IdentityResponse>(
                "/profile",
                "PATCH",
                { ...d, locale },
              );
              setUser(result.user);
              setSuccess(t("success"));
            })}
          >
            {field("name", "name", {
              defaultValue: user?.name,
              maxLength: 120,
              autoComplete: "name",
            })}
            {field("username", "username", {
              defaultValue: user?.username ?? "",
              pattern: "[a-zA-Z0-9_]{3,40}",
              maxLength: 40,
              autoComplete: "nickname",
            })}
            <label>
              {t("bio")}
              <textarea
                name="bio"
                defaultValue={user?.bio ?? ""}
                maxLength={160}
              />
            </label>
            <button className="primary" disabled={busy || offline}>
              {t("save")}
            </button>
          </form>
        </section>
      );
    if (screen === "sessions")
      return (
        <section className="card">
          <h1>{t("sessions")}</h1>
          {sessions.length === 0 && <p>{t("empty")}</p>}
          {sessions.map((s) => (
            <div className="row spread document" key={s.id}>
              <div>
                <strong>{s.name}</strong>
                <p className="muted">
                  {s.last_used_at
                    ? new Intl.DateTimeFormat(locale, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(s.last_used_at))
                    : t("empty")}
                  {s.current ? " · " + t("account") : ""}
                </p>
              </div>
              <button
                disabled={busy || offline}
                onClick={() =>
                  void run(async () => {
                    await api.request("/sessions/" + s.id, "DELETE");
                    if (s.current) clear();
                    else setSessions((x) => x.filter((v) => v.id !== s.id));
                  })
                }
              >
                {t("revoke")}
              </button>
            </div>
          ))}
        </section>
      );
    if (screen === "mode")
      return (
        <section className="card measure">
          <h1>{t("mode")}</h1>
          <button
            onClick={() =>
              void run(async () => {
                await api.request("/context", "PUT", { mode: "customer" });
                setStore(null);
                go("home");
              })
            }
          >
            {t("customer")}
          </button>
          {user?.stores.map((s) => (
            <div className="document" key={s.id}>
              <h2>{s.name}</h2>
              <p>{s.role}</p>
              <button
                disabled={busy || offline}
                onClick={() =>
                  void run(async () => {
                    const result = await api.request<{
                      store: { id: number; name: string };
                    }>("/context", "PUT", { mode: "merchant", store_id: s.id });
                    setStore(result.store);
                    go("home");
                  })
                }
              >
                {t("merchant")}
              </button>
            </div>
          ))}
          {!user?.stores.length && <p>{t("noMerchant")}</p>}
          <button
            className="link"
            disabled={busy}
            onClick={() =>
              void run(async () => {
                await refreshUser();
                setSuccess(t("success"));
              })
            }
          >
            {t("refresh")}
          </button>
        </section>
      );
    if (screen === "account")
      return (
        <>
          <PasswordChange
            api={api}
            run={run}
            t={t}
            busy={busy}
            offline={offline}
            onChanged={clear}
          />
          <section className="card measure">
            <h1>{t("account")}</h1>
            <p className="notice">{t("accountWarning")}</p>
            <form
              onSubmit={submit(async (d) => {
                await api.request("/account/actions", "POST", d);
                clear();
              })}
            >
              {password()}
              <label>
                {t("account")}
                <select aria-label={t("account")} name="action">
                  <option value="deactivate">{t("deactivate")}</option>
                  <option value="request_deletion">{t("delete")}</option>
                </select>
              </label>
              <label className="check">
                <input type="checkbox" required />
                {t("confirm")}
              </label>
              <button className="danger" disabled={busy || offline}>
                {t("confirm")}
              </button>
            </form>
          </section>
          <AddressBook
            api={api}
            run={run}
            t={t}
            busy={busy}
            offline={offline}
          />
        </>
      );
    if (screen === "application")
      return (
        <>
          <div className="row spread page-head">
            <h1>{t("application")}</h1>
            <button
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  const data = await loadApps();
                  setSelected(
                    data.applications.find((a) => a.id === selected?.id) ??
                      null,
                  );
                  await refreshUser();
                })
              }
            >
              {t("refresh")}
            </button>
          </div>
          <p className="notice">{t("policy")}</p>
          <div className="grid">
            <section className="card">
              <h2>{t("applications")}</h2>
              {apps.length === 0 && <p>{t("empty")}</p>}
              {apps.map((a) => (
                <button
                  style={{ width: "100%", marginBottom: 12, textAlign: "left" }}
                  key={a.id}
                  onClick={() => setSelected(a)}
                >
                  <strong>{a.store_name}</strong>
                  <br />
                  <span className="pill">{t(a.status)}</span>
                </button>
              ))}
              {!apps.some(editable) && (
                <button onClick={() => setSelected(null)}>
                  {t("newApplication")}
                </button>
              )}
            </section>
            <section className="card">
              {selected ? (
                <>
                  <div className="row spread">
                    <h2>{selected.store_name}</h2>
                    <span className="pill">{t(selected.status)}</span>
                  </div>
                  {selected.review_reason && (
                    <p className="notice">{selected.review_reason}</p>
                  )}
                  {editable(selected) ? (
                    <>
                      {applicationForm(selected)}
                      <hr />
                      <h3>{t("evidence")}</h3>
                      <p className="muted">{t("evidenceHelp")}</p>
                      <p>{t("privacy")}</p>
                      {selected.documents.map((d) => (
                        <div className="row spread document" key={d.id}>
                          <span>{d.name}</span>
                          <button
                            disabled={busy || offline}
                            onClick={() =>
                              void run(async () =>
                                updateApplication(
                                  await api.request<ApplicationResponse>(
                                    "/merchant/applications/" +
                                      selected.id +
                                      "/documents/" +
                                      d.id,
                                    "DELETE",
                                  ),
                                ),
                              )
                            }
                          >
                            {t("remove")}
                          </button>
                        </div>
                      ))}
                      <label>
                        {t("upload")}
                        <input
                          aria-label={t("upload")}
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          disabled={busy || offline}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const data = new FormData();
                            data.append("document", file);
                            void run(async () => {
                              if (file.size > 5 * 1024 * 1024)
                                throw new ApiError(422, {}, t("evidenceHelp"));
                              updateApplication(
                                await api.request<ApplicationResponse>(
                                  "/merchant/applications/" +
                                    selected.id +
                                    "/documents",
                                  "POST",
                                  data,
                                ),
                              );
                            });
                            e.target.value = "";
                          }}
                        />
                      </label>
                      <form
                        onSubmit={submit(async () => {
                          updateApplication(
                            await api.request<ApplicationResponse>(
                              "/merchant/applications/" +
                                selected.id +
                                "/submit",
                              "POST",
                              {
                                revision: selected.revision,
                                declaration: true,
                              },
                            ),
                          );
                        })}
                      >
                        <label className="check">
                          <input type="checkbox" required />
                          {t("declaration")}
                        </label>
                        <button className="primary" disabled={busy || offline}>
                          {t("submit")}
                        </button>
                      </form>
                    </>
                  ) : (
                    <>
                      <p>
                        {t(
                          selected.status === "approved"
                            ? "approved"
                            : "pending",
                        )}
                      </p>
                      {selected.status === "approved" && (
                        <button
                          onClick={() =>
                            void run(async () => {
                              await refreshUser();
                              go("mode");
                            })
                          }
                        >
                          {t("mode")}
                        </button>
                      )}
                    </>
                  )}
                </>
              ) : (
                applicationForm(null)
              )}
            </section>
          </div>
        </>
      );
    if (screen === "queue")
      return (
        <section className="card">
          <div className="row spread">
            <h1>{t("queue")}</h1>
            <button
              onClick={() =>
                void run(async () => {
                  await loadApps();
                })
              }
            >
              {t("refresh")}
            </button>
          </div>
          <form
            className="row"
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              void run(async () => {
                await loadApps();
              });
            }}
          >
            <label>
              {t("search")}
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                maxLength={100}
              />
            </label>
            <label>
              {t("filter")}
              <select
                aria-label={t("filter")}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="">{t("all")}</option>
                {(
                  [
                    "submitted",
                    "resubmitted",
                    "under_review",
                    "information_needed",
                    "approved",
                    "rejected",
                  ] as const
                ).map((s) => (
                  <option value={s} key={s}>
                    {t(s)}
                  </option>
                ))}
              </select>
            </label>
            <button disabled={busy}>{t("continue")}</button>
          </form>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t("storeName")}</th>
                  <th>{t("status")}</th>
                  <th>{t("review")}</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((a) => (
                  <tr key={a.id}>
                    <td>{a.store_name}</td>
                    <td>
                      <span className="pill">{t(a.status)}</span>
                    </td>
                    <td>
                      <button
                        disabled={busy || offline}
                        onClick={() =>
                          void run(async () => {
                            let data = await api.request<ApplicationResponse>(
                              "/admin/applications/" + a.id,
                            );
                            if (
                              ["submitted", "resubmitted"].includes(
                                data.application.status,
                              )
                            )
                              data = await api.request<ApplicationResponse>(
                                "/admin/applications/" + a.id + "/start",
                                "POST",
                                { revision: data.application.revision },
                              );
                            setSelected(data.application);
                            go("review");
                          })
                        }
                      >
                        {t("review")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!apps.length && <p className="empty">{t("empty")}</p>}
          <div className="row">
            <button
              disabled={page <= 1 || busy}
              onClick={() => setPage((p) => p - 1)}
            >
              {t("previous")}
            </button>
            <span>
              {page} / {lastPage}
            </span>
            <button
              disabled={page >= lastPage || busy}
              onClick={() => setPage((p) => p + 1)}
            >
              {t("next")}
            </button>
          </div>
        </section>
      );
    if (screen === "review" && selected)
      return (
        <section className="card measure">
          <button className="link" onClick={() => go("queue")}>
            {t("back")}
          </button>
          <h1>{selected.store_name}</h1>
          <span className="pill">{t(selected.status)}</span>
          <dl>
            <dt>{t("representative")}</dt>
            <dd>{selected.representative}</dd>
            <dt>{t("businessType")}</dt>
            <dd>{t(selected.business_type)}</dd>
            <dt>{t("identifier")}</dt>
            <dd>{selected.applicant?.email ?? selected.applicant?.phone}</dd>
          </dl>
          <h2>{t("evidence")}</h2>
          {selected.documents.length === 0 && <p>{t("empty")}</p>}
          {selected.documents.map((d) => (
            <div className="document" key={d.id}>
              <a
                href={
                  "/api/v1/admin/applications/" +
                  selected.id +
                  "/documents/" +
                  d.id
                }
                download
              >
                {t("viewDocument")}: {d.name}
              </a>
            </div>
          ))}
          {["submitted", "resubmitted", "under_review"].includes(
            selected.status,
          ) ? (
            <form
              onSubmit={submit(async (d) =>
                setDecision(
                  await api.request<Decision>(
                    "/admin/applications/" + selected.id + "/decisions",
                    "POST",
                    { ...d, revision: selected.revision },
                  ),
                ),
              )}
            >
              <label>
                {t("review")}
                <select aria-label={t("review")} name="action">
                  <option value="request_information">
                    {t("request_information")}
                  </option>
                  <option value="approve">{t("approve")}</option>
                  <option value="reject">{t("reject")}</option>
                </select>
              </label>
              <label>
                {t("reason")}
                <textarea
                  name="reason"
                  required
                  minLength={3}
                  maxLength={1000}
                />
              </label>
              <button className="primary" disabled={busy || offline}>
                {t("continue")}
              </button>
            </form>
          ) : (
            <p className="notice">{selected.review_reason}</p>
          )}
        </section>
      );
    return null;
  };
  const isAuth = !user || screen === "mfa";
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      {busy && (
        <div className="progress" role="progressbar" aria-label={t("busy")} />
      )}
      <header className="topbar">
        <Brand />
        <div className="controls">
          <select
            aria-label={t("language")}
            disabled={starting || busy}
            value={locale}
            onChange={(e) => {
              const next = e.target.value as Locale;
              setLocale(next);
              if (user)
                void run(async () =>
                  setUser(
                    (
                      await api.request<IdentityResponse>(
                        "/preferences",
                        "PATCH",
                        { locale: next, country: "ET" },
                      )
                    ).user,
                  ),
                );
            }}
          >
            <option value="en">English</option>
            <option value="am">አማርኛ</option>
          </select>
          <button
            aria-label={t("theme")}
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {t(theme === "light" ? "dark" : "light")}
          </button>
          {user && (
            <button
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  await api.request("/auth/logout", "POST");
                  clear();
                })
              }
            >
              {t("signOut")}
            </button>
          )}
        </div>
      </header>
      {starting ? (
        <main className="auth-form" aria-busy="true">
          {t("busy")}
        </main>
      ) : (
        <div className={isAuth ? "auth-layout" : "shell"}>
          {isAuth ? (
            <aside className="story">
              <span className="pill">{t("development")}</span>
              <h1>{t("welcome")}</h1>
              <p>{t("intro")}</p>
              <div className="orbit" aria-hidden="true">
                s
              </div>
              <footer style={{ color: "#cfdfd3" }}>
                Segno Gebeya · Ethiopia
              </footer>
            </aside>
          ) : (
            <aside className="sidebar">
              <nav aria-label={t("account")}>
                {(area === "admin"
                  ? ["queue", "sessions", "profile"]
                  : store
                    ? ["home", "mode", "profile", "sessions", "account"]
                    : ([
                        "home",
                        "application",
                        "mode",
                        "profile",
                        "sessions",
                        "account",
                      ] as Screen[])
                ).map((s) => (
                  <button
                    key={s}
                    aria-current={screen === s ? "page" : undefined}
                    onClick={() => go(s as Screen)}
                  >
                    {t(
                      (s === "queue"
                        ? "queue"
                        : s === "mode"
                          ? "mode"
                          : s) as MessageKey,
                    )}
                  </button>
                ))}
              </nav>
              <small>
                {t("development")}
                <br />
                {t("scope")}
              </small>
              {store && (
                <p className="notice">
                  {t("store")}: {store.name}
                </p>
              )}
            </aside>
          )}
          <main id="main" className={isAuth ? "auth-form" : "content"}>
            <div className={isAuth ? "form-box" : undefined}>
              {offline && (
                <p className="notice error" role="status">
                  {t("offline")}
                </p>
              )}
              {error && (
                <div
                  className="notice error"
                  tabIndex={-1}
                  ref={errorBox}
                  role="alert"
                >
                  <strong>{localizeError(locale, error.message)}</strong>
                  {Object.entries(error.fields).map(([k, v]) => (
                    <p key={k}>
                      {v.map((value) => localizeError(locale, value)).join(" ")}
                    </p>
                  ))}
                  {error.requestId && <small>{error.requestId}</small>}
                  {error.status === 403 && area === "admin" && (
                    <button onClick={() => go("mfa")}>{t("mfa")}</button>
                  )}
                </div>
              )}
              {success && (
                <p className="status" role="status">
                  {success}
                </p>
              )}
              {isAuth ? authContent() : content()}
              <footer>
                {t("development")} ·{" "}
                {locale === "am" ? t("notice") : "Segno Gebeya · M1"}
              </footer>
            </div>
          </main>
        </div>
      )}
      <dialog
        ref={dialog}
        onCancel={() => setDecision(null)}
        aria-labelledby="confirm-title"
      >
        <h2 id="confirm-title">{t("confirmReview")}</h2>
        <p>{t("reviewWarning")}</p>
        {decision && error && (
          <p role="alert" className="notice error">
            {localizeError(locale, error.message)}
          </p>
        )}
        {decision && (
          <dl>
            <dt>{t("storeName")}</dt>
            <dd>{decision.summary.store_name}</dd>
            <dt>{t("review")}</dt>
            <dd>{t(decision.summary.action as MessageKey)}</dd>
            <dt>{t("reason")}</dt>
            <dd>{decision.summary.reason}</dd>
          </dl>
        )}
        <div className="row">
          <button onClick={() => setDecision(null)}>{t("cancel")}</button>
          <button
            className="primary"
            disabled={busy || offline}
            onClick={() =>
              void run(async () => {
                if (!decision) return;
                updateApplication(
                  await api.request<ApplicationResponse>(
                    "/admin/confirmations/" + decision.confirmation_id,
                    "POST",
                    { token: decision.token },
                  ),
                );
                setDecision(null);
              })
            }
          >
            {t("confirm")}
          </button>
        </div>
      </dialog>
    </>
  );
}
function Password({
  label,
  name,
  show,
  hide,
  min,
  help,
}: {
  label: string;
  name: string;
  show: string;
  hide: string;
  min?: number;
  help?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <label>
      {label}
      <div className="password">
        <input
          aria-label={label}
          name={name}
          type={visible ? "text" : "password"}
          required
          minLength={min}
          maxLength={128}
          autoComplete={min ? "new-password" : "current-password"}
        />
        <button type="button" onClick={() => setVisible((v) => !v)}>
          {visible ? hide : show}
        </button>
      </div>
      {help && <small>{help}</small>}
    </label>
  );
}
