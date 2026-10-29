import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Link preview card for WhatsApp / X / Discord / LinkedIn shares
export const alt = "Audinta Sakti Firmansyah (ausfear)";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logo = await readFile(join(process.cwd(), "public/icon.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 96px",
          background: "linear-gradient(120deg, #09090b 55%, #2b1408 100%)",
          color: "#ffffff",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain <img> */}
        <img
          src={logoSrc}
          width={72}
          height={72}
          alt=""
          style={{ filter: "brightness(0) invert(1)", marginBottom: 40 }}
        />
        <div style={{ fontSize: 104, letterSpacing: -2, lineHeight: 1 }}>AUDINTA SAKTI</div>
        <div style={{ fontSize: 56, color: "#ff6b2b", marginTop: 16 }}>ausfear</div>
        <div style={{ width: 96, height: 4, background: "#ff6b2b", marginTop: 44 }} />
        <div
          style={{
            fontSize: 22,
            color: "rgba(255,255,255,0.6)",
            marginTop: 28,
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          Game Enjoyer · Music Listener · Occasional Math Guy
        </div>
      </div>
    ),
    size
  );
}
