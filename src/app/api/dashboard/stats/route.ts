import { NextResponse } from 'next/server';
import { DashboardService } from '@/modules/dashboard/service';

export async function GET() {
  try {
    const stats = await DashboardService.getDashboardStats();
    
    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Dashboard stats API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch dashboard statistics'
      },
      { status: 500 }
    );
  }
}