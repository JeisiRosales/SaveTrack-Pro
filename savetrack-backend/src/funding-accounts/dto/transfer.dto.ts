import { IsNotEmpty, IsNumber, Min } from "class-validator";

export class TransferDto {
    @IsNotEmpty()
    fromAccountId: string;
    @IsNotEmpty()
    toAccountId: string;
    @IsNumber()
    @Min(0.01)
    amount: number;
}