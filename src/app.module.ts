import { join } from 'path';
import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { RecordModule } from './Record/record.module';
import { RecordService } from './Record/record.service';
import { GraphQLModule, GqlModuleOptions } from '@nestjs/graphql';
import { AppResolver } from './app/app.resolver';
import { AppService } from './app/app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeormConfig } from './shared/util/typeOrmConfig';
import { AuthModule } from './auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
console.log(__dirname);

const path = join(__dirname, '../src/templates');
console.log(path);
@Module({
  imports: [
    UserModule,
    RecordModule,
    TypeOrmModule.forRoot({
      keepConnectionAlive: true,
      ...typeormConfig,
    }),
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: 'kylehan101@gmail.com',
            pass: '',
          },
        },
        defaults: {
          from: 'kylehan101@gmail.com',
        },
        template: {
          dir: path,
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
    GraphQLModule.forRootAsync({
      useFactory: () => {
        const schemaModuleOptions: Partial<GqlModuleOptions> = {};

        // If we are in development, we want to generate the schema.graphql
        if (process.env.NODE_ENV !== 'production' || process.env.IS_OFFLINE) {
          schemaModuleOptions.autoSchemaFile = 'schema.graphql';
          schemaModuleOptions.debug = true;
        } else {
          // For production, the file should be generated
          schemaModuleOptions.typePaths = ['dist/schema.graphql'];
        }

        schemaModuleOptions.uploads = {
          maxFileSize: 10000000, // 10 MB
          maxFiles: 5,
        };

        schemaModuleOptions.formatError = (error) => {
          console.log(error.message);
          return error;
        };

        return {
          context: ({ req }) => ({ req }),
          installSubscriptionHandlers: true,
          playground: true, // Allow playground in production
          introspection: true, // Allow introspection in production
          ...schemaModuleOptions,
        };
      },
    }),
    AuthModule,
  ],
  providers: [AppService, RecordService, AppResolver],
})
export class AppModule {}
