import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { passportJwtSecret } from 'jwks-rsa';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            // Usar JWKS en lugar de una clave secreta estática
            secretOrKeyProvider: passportJwtSecret({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: `${configService.get<string>('SUPABASE_URL')}/auth/v1/.well-known/jwks.json`,
            }),
            algorithms: ['ES256'], // Algoritmo correcto para Supabase
        });
    }

    async validate(payload: any) {
        console.log('JwtStrategy: Token validated successfully. Payload:', payload);
        // Aquí puedes añadir lógica adicional si necesitas verificar algo más.
        // Lo que retornes aquí se inyectará en `req.user`
        return { id: payload.sub, email: payload.email, ...payload.user_metadata };
    }
}
