import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/db';
import { setAdminSession } from '@/lib/session';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    username?: string;
    password?: string;
  } | null;

  console.log('👉 [Debug 1] 收到前端登入請求的帳號:', body?.username);

  if (!body?.username || !body.password) {
    return Response.json({ error: '請輸入使用者名稱與密碼。' }, { status: 400 });
  }

  // 透過 Supabase 查詢管理員
  const { data: admin, error } = await supabase
    .from('admins')
    .select('username, password_hash')
    .eq('username', body.username)
    .single();

  console.log('👉 [Debug 2] Supabase 查詢錯誤 (若有):', error);
  console.log('👉 [Debug 3] Supabase 查詢到的資料:', admin);

  if (error || !admin) {
    console.log('❌ 登入失敗：找不到帳號或資料庫連線錯誤');
    return Response.json({ error: '帳號或密碼錯誤。' }, { status: 401 });
  }

  const isPasswordValid = bcrypt.compareSync(body.password, admin.password_hash);
  console.log('👉 [Debug 4] 密碼比對結果:', isPasswordValid);

  if (!isPasswordValid) {
    console.log('❌ 登入失敗：密碼比對錯誤');
    return Response.json({ error: '帳號或密碼錯誤。' }, { status: 401 });
  }

  console.log('✅ 登入成功！準備寫入 Session');
  await setAdminSession(admin.username);
  return Response.json({ success: true });
}
