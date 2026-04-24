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

    try {
      this.logger.log(`Upserting data into ${table}...`);
      const { data: result, error } = await this.client
        .from(table)
        .upsert(data, {
          onConflict: table === 'user_vocabulary' ? 'user_id,word' : 'user_id',
        })
        .select();

      if (error) {
        this.logger.error(
          `Supabase upsert error in ${table}: ${error.message}`,
        );
        throw error;
      }
      this.logger.log(
        `Successfully upserted ${result?.length || 0} rows into ${table}`,
      );
      return result ?? [];
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to upsert data into ${table}: ${message}`);
      throw error;
    }
  }

  async getData(
    table: string,
    query: { userId?: string; user_id?: string } = {},
  ): Promise<any[]> {
    if (!this.client) {
      throw new Error('Supabase client not initialized');
    }

    let builder = this.client.from(table).select('*');

    const uid = query.userId || query.user_id;
    if (uid) {
      builder = builder.eq('user_id', uid);
    }

    const { data, error } = await builder;

    if (error) {
      this.logger.error(`Error fetching from ${table}: ${error.message}`);
      throw error;
    }

    return data ?? [];
  }
}
