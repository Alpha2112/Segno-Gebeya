import { useEffect, useState } from "react";
import { createClient } from "@segno/api-client";
import type { Address, IdentityResponse, User } from "@segno/contracts";
import type { MessageKey } from "@segno/localization";
export interface ExtrasProps {
  api: ReturnType<typeof createClient>;
  run: (work: () => Promise<void>) => Promise<void>;
  t: (key: MessageKey) => string;
  busy: boolean;
  offline: boolean;
}
export function ProfilePhoto({
  api,
  run,
  t,
  busy,
  offline,
  user,
  setUser,
}: ExtrasProps & { user: User; setUser: (u: User) => void }) {
  const [version, setVersion] = useState(0);
  return (
    <section className="stack" style={{ marginBottom: 24 }}>
      <h2>{t("photo")}</h2>
      {user.has_photo && (
        <img
          alt={t("photo")}
          src={
            "/api/v1/profile/photo?user=" +
            user.id +
            "&revision=" +
            user.photo_version +
            "&v=" +
            version
          }
          width={104}
          height={104}
          style={{ borderRadius: 52, objectFit: "cover" }}
        />
      )}
      <label>
        {t("uploadPhoto")}
        <input
          aria-label={t("uploadPhoto")}
          type="file"
          accept="image/png,image/jpeg"
          disabled={busy || offline}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const data = new FormData();
            data.append("photo", file);
            void run(async () => {
              setUser(
                (
                  await api.request<IdentityResponse>(
                    "/profile/photo",
                    "POST",
                    data,
                  )
                ).user,
              );
              setVersion((v) => v + 1);
            });
            e.target.value = "";
          }}
        />
      </label>
      <small>{t("photoHelp")}</small>
      {user.has_photo && (
        <button
          disabled={busy || offline}
          onClick={() =>
            void run(async () =>
              setUser(
                (
                  await api.request<IdentityResponse>(
                    "/profile/photo",
                    "DELETE",
                  )
                ).user,
              ),
            )
          }
        >
          {t("removePhoto")}
        </button>
      )}
    </section>
  );
}
const keys = [
  "label",
  "recipient",
  "phone",
  "city",
  "sub_city",
  "woreda",
  "house",
  "directions",
] as const;
export function AddressBook({ api, run, t, busy, offline }: ExtrasProps) {
  const [addresses, setAddresses] = useState<Address[]>([]),
    [editing, setEditing] = useState<Address | null>(null),
    [form, setForm] = useState<Record<string, string>>({}),
    [primary, setPrimary] = useState(true);
  const load = async () =>
    setAddresses(
      (await api.request<{ addresses: Address[] }>("/addresses")).addresses,
    );
  useEffect(() => {
    void run(load);
  }, []);
  return (
    <section className="card measure" style={{ marginTop: 24 }}>
      <h2>{t("addresses")}</h2>
      <p className="notice">{t("country")}: Ethiopia · ET</p>
      {!addresses.length && <p>{t("empty")}</p>}
      {addresses.map((a) => (
        <div className="document" key={a.id}>
          <h3>
            {a.label}
            {a.is_default ? " · " + t("defaultAddress") : ""}
          </h3>
          <p>
            {a.recipient} · {a.city}
            <br />
            {[a.sub_city, a.woreda, a.house, a.directions]
              .filter(Boolean)
              .join(", ")}
            <br />
            {a.phone}
          </p>
          <div className="row">
            <button
              disabled={busy}
              onClick={() => {
                setEditing(a);
                setForm(Object.fromEntries(keys.map((k) => [k, a[k] ?? ""])));
                setPrimary(a.is_default);
              }}
            >
              {t("edit")}
            </button>
            <button
              disabled={busy || offline}
              onClick={() =>
                void run(async () => {
                  await api.request("/addresses/" + a.id, "DELETE");
                  await load();
                })
              }
            >
              {t("remove")}
            </button>
          </div>
        </div>
      ))}
      <h3>{t(editing ? "edit" : "newAddress")}</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void run(async () => {
            await api.request(
              "/addresses" + (editing ? "/" + editing.id : ""),
              editing ? "PATCH" : "POST",
              { ...form, country: "ET", is_default: primary },
            );
            setEditing(null);
            setForm({});
            await load();
          });
        }}
      >
        {keys.map((k) => (
          <label key={k}>
            {t(k)}
            <input
              aria-label={t(k)}
              value={form[k] ?? ""}
              onChange={(e) => setForm((v) => ({ ...v, [k]: e.target.value }))}
              required={["label", "recipient", "phone", "city"].includes(k)}
              maxLength={
                k === "directions"
                  ? 500
                  : k === "recipient"
                    ? 120
                    : k === "phone"
                      ? 32
                      : k === "label"
                        ? 50
                        : 80
              }
              autoComplete={
                k === "phone" ? "tel" : k === "recipient" ? "name" : "off"
              }
            />
          </label>
        ))}
        <label className="check">
          <input
            type="checkbox"
            checked={primary}
            onChange={(e) => setPrimary(e.target.checked)}
          />
          {t("defaultAddress")}
        </label>
        <div className="row">
          <button className="primary" disabled={busy || offline}>
            {t("save")}
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setForm({});
              }}
            >
              {t("cancel")}
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
export function PasswordChange({
  api,
  run,
  t,
  busy,
  offline,
  onChanged,
}: ExtrasProps & { onChanged: () => void }) {
  const [show, setShow] = useState(false);
  return (
    <section className="card measure" style={{ marginBottom: 24 }}>
      <h2>{t("changePassword")}</h2>
      <p>{t("passwordChangeHelp")}</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const data = Object.fromEntries(new FormData(e.currentTarget));
          void run(async () => {
            await api.request("/account/password", "POST", data);
            onChanged();
          });
        }}
      >
        {(
          ["current_password", "password", "password_confirmation"] as const
        ).map((name, i) => (
          <label key={name}>
            {t(
              i === 0
                ? "currentPassword"
                : i === 1
                  ? "password"
                  : "confirmPassword",
            )}
            <input
              aria-label={t(
                i === 0
                  ? "currentPassword"
                  : i === 1
                    ? "password"
                    : "confirmPassword",
              )}
              name={name}
              type={show ? "text" : "password"}
              required
              minLength={i === 0 ? undefined : 12}
              maxLength={128}
              autoComplete={i === 0 ? "current-password" : "new-password"}
            />
          </label>
        ))}
        <label className="check">
          <input
            type="checkbox"
            checked={show}
            onChange={(e) => setShow(e.target.checked)}
          />
          {t("showPassword")}
        </label>
        <button className="primary" disabled={busy || offline}>
          {t("changePassword")}
        </button>
      </form>
    </section>
  );
}
