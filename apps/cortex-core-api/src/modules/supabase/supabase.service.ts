import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private client: SupabaseClient<any, any, any>;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>(
      'NEXT_PUBLIC_SUPABASE_URL',
    );
    const supabaseKey = this.configService.get<string>(
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    );

    if (!supabaseUrl || !supabaseKey) {
      this.logger.error(
        'Supabase credentials missing in environment variables (NEXT_PUBLIC_...)',
      );
      return;
    }

    this.client = createClient(supabaseUrl, supabaseKey);
    this.logger.log('Supabase client initialized successfully');
  }

  getClient(): SupabaseClient<any, any, any> {
    return this.client;
  }

  async upsertData(table: string, data: any): Promise<any[]> {
    if (!this.client) {
      throw new Error('Supabase client not initialized');
    }

    const { data: result, error } = await this.client
      .from(table)
      .upsert(data)
      .select();

    if (error) {
      this.logger.error(`Error upserting to ${table}: ${error.message}`);
      throw error;
    }

    return result ?? [];
  }

  async getData(
    table: string,
    query: { userId?: string } = {},
  ): Promise<any[]> {
    if (!this.client) {
      throw new Error('Supabase client not initialized');
    }

    let builder = this.client.from(table).select('*');

    if (query?.userId) {
      builder = builder.eq('user_id', query.userId);
    }

    const { data, error } = await builder;

    if (error) {
      this.logger.error(`Error fetching from ${table}: ${error.message}`);
      throw error;
    }

    return data ?? [];
  }
}
