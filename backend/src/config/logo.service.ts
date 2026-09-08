import { Injectable } from "@nestjs/common";
import * as fs from "fs/promises";
import { IMAGES_PATH } from "./logoPaths";
import * as sharp from "sharp";
const sharpFn = (sharp as any).default || sharp;

@Injectable()
export class LogoService {
  // Everything here is awaited on purpose. create answers the http request
  // that uploaded the logo, so when it resolves the caller is told the job is
  // done; starting the favicon and the icons without waiting meant the
  // response went out while they were still being written, and a failure in
  // either surfaced as an unhandled rejection rather than as an error the
  // admin could see.
  async create(file: Buffer) {
    const resized = await sharpFn(file).resize(900).toBuffer();
    await fs.writeFile(`${IMAGES_PATH}/logo.png`, resized, "binary");

    await this.createFavicon(file);
    await this.createPWAIcons(file);
  }

  async createDark(file: Buffer) {
    const resized = await sharpFn(file).resize(900).toBuffer();
    await fs.writeFile(`${IMAGES_PATH}/logo-dark.png`, resized, "binary");
  }

  async createFavicon(file: Buffer) {
    const resized = await sharpFn(file).resize(16).toBuffer();
    await fs.writeFile(`${IMAGES_PATH}/favicon.ico`, resized, "binary");
  }

  async createPWAIcons(file: Buffer) {
    const sizes = [48, 72, 96, 128, 144, 152, 192, 384, 512];

    await Promise.all(
      sizes.map((size) =>
        sharpFn(file)
          .resize(size)
          .png()
          .toFile(`${IMAGES_PATH}/icons/icon-${size}x${size}.png`),
      ),
    );
  }
}
