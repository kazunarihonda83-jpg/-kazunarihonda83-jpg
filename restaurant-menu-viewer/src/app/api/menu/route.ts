import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'menu-data.json');

// GET: メニューデータを取得
export async function GET() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return NextResponse.json(JSON.parse(data));
    }
    return NextResponse.json({ error: 'No data found' }, { status: 404 });
  } catch (error) {
    console.error('Error reading menu data:', error);
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }
}

// POST: メニューデータを保存
export async function POST(request: Request) {
  try {
    const data = await request.json();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log('✅ Menu data updated');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving menu data:', error);
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}
