import { IsNotEmpty } from "class-validator";

export class TransferDto {
    @IsNotEmpty()
    fromAccountId: string;
    @IsNotEmpty()
    toAccountId: string;
    @IsNotEmpty()
    amount: number;
}