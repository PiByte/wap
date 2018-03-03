//The opposite of compiler.ts

class disassembler
{
    private readonly insts: Array<string> = ["hlt", "lda", "sta", "jmp", "spc", "and", "or", "add", "sub", "jnz", "cmp", "jnd", "jnc", "rol", "ror", "clf"];    
    private readonly no_operand: Array<string> = ["0", "d", "e", "f"]; // commands that dont require an operand
    
    private readonly address_prefix: string = "$";
    private readonly comment_prefix: string = ";";

    private PC: number = 0x00;
    private RUNNING: boolean = false;

    private log(reason: string, location: string = "0", type: number = 3): void
    {
        switch (type)
        {
            case 1: //Error
                console.error("Error! 0x" + location.toUpperCase() + " (" + reason + ")");
            break;
            case 2: //Warning
                console.warn("Warning! 0x" + reason + " (0x" + location.toUpperCase() + ")");
            break;
            case 3: //Info
                console.log(reason);
            break;
        }
    }

    public disassemble(binary: string): string
    {
        let file: string = ""; //Final file that function returns
        this.RUNNING = true;

        let jump: number = 0;

        // Check if any unwanted letters have been thrown in
        for (let i = 0; i < binary.length; i++) {
            if (isNaN(parseInt("0x" + binary[i]))) // )))))))))))))))))))))))))))))))))
                return "Not a number! (0x" + i.toString(16).toUpperCase() + ")";
        }

        while (this.RUNNING)
        {
            jump = 3;

            // Check if operation requires operand
            let require_operand: boolean = true;
            for (let i: number = 0; i < this.no_operand.length; i++)
            {
                if (binary[this.PC] == this.no_operand[i]) // if it matches
                {
                    require_operand = false;
                    jump = 1;
                    break;
                } 
            }

            // TODO: check for errors, like if required operand is missing
            file += this.insts[parseInt("0x" + binary[this.PC])];
            
            if (require_operand)
                if (binary[this.PC + 1] == undefined || binary[this.PC + 2] == undefined) // Check if operand exists (also ugly code)
                    return "Missing operand!";
                else
                    file += " " + this.address_prefix + binary[this.PC + 2] + binary[this.PC + 1]; // get operand

            
            //Check if end of file
            if (binary[this.PC + jump] === undefined)
                this.RUNNING = false;

            file += "\n" //Newline
            this.PC += jump;
        }

        this.PC = 0x00; //Reset program counter
        return file;
    }
}