/**
 * Kiểm thử phần xác thực chữ ký webhook Polar.
 * Được gọi từ test/run-tests.js.
 */
import crypto from 'node:crypto';
import { chuKyHopLe } from '../api/webhook.js';

export function kiemThuWebhook(bao) {
  const than = JSON.stringify({
    type: 'order.paid',
    data: { id: 'ord_thu', amount: 243000, currency: 'VND' },
  });
  const id = 'msg_thu_1';
  const ts = String(Math.floor(Date.now() / 1000));

  const ky = (khoaBytes) =>
    'v1,' +
    crypto.createHmac('sha256', khoaBytes).update(`${id}.${ts}.${than}`, 'utf8').digest('base64');

  const goi = (secret, chuKyHeader, thanGui = than) =>
    chuKyHopLe({ id, timestamp: ts, chuKyHeader, thanThô: thanGui, secret });

  // Cơ chế mới: secret là chuỗi base64, có tiền tố whsec_
  const raw = crypto.randomBytes(32);
  const secretSW = 'whsec_' + raw.toString('base64');
  bao(goi(secretSW, ky(raw)), 'Standard Webhooks — secret base64 kèm tiền tố');

  // Cùng cơ chế nhưng secret không có tiền tố
  const secretB64 = raw.toString('base64');
  bao(goi(secretB64, ky(raw)), 'Standard Webhooks — secret không tiền tố');

  // Cơ chế cũ của Polar: base64-encode chuỗi secret rồi mới dùng làm khoá
  const secretCu = 'polar_whs_vi_du_cu';
  const khoaCu = Buffer.from(Buffer.from(secretCu, 'utf8').toString('base64'), 'utf8');
  bao(goi(secretCu, ky(khoaCu)), 'Polar HMAC cũ — secret được base64-encode');

  // Header chứa nhiều chữ ký (dùng khi xoay khoá)
  bao(goi(secretSW, 'v1,AAAA= ' + ky(raw)), 'Nhiều chữ ký cách nhau bằng dấu cách');

  // Các trường hợp BẮT BUỘC phải từ chối
  bao(!goi(secretSW, ky(raw), than + ' '), 'Từ chối khi thân gói tin bị sửa một ký tự');
  bao(
    !goi('whsec_' + crypto.randomBytes(32).toString('base64'), ky(raw)),
    'Từ chối khi sai secret'
  );
  bao(!goi(secretSW, null), 'Từ chối khi thiếu header chữ ký');
  bao(!goi(secretSW, 'v1,'), 'Từ chối khi chữ ký rỗng');
}
