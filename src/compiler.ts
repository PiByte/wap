// Compiler for wap

// This horrible class was my first attempt at building some kind of compiler/assembler

class compiler
{
    private readonly insts: Array<string> = ["hlt", "lda", "sta", "jmp", "spc", "and", "or", "add", "sub", "jnz", "cmp", "jnd", "jnc", "rol", "ror", "clf"];    
    private readonly no_operand: Array<string> = ["0", "d", "e", "f"]; // commands that dont require an operand
    
    private readonly address_prefix: string = "$";
    private readonly comment_prefix: string = ";";

    private log(reason: string, location: string = "0", type: number = 3): void
    {
        switch (type)
        {
            case 1: //Error
                console.error("Compilation error at 0x" + location.toUpperCase() + " (" + reason + ")");
            break;
            case 2: //Warning
                console.warn("Compilation warning! " + reason + " (0x" + location.toUpperCase() + ")");
            break;
            case 3: //Info
                console.log(reason);
            break;
        }
    }

    public compile(file: string): string
    {
        if (!file)
            return "no file!";

        //Reset binary
        let binary: string = "";

        let lines: Array<string> = file.split(/\r?\n/); //Split every newline

        // Remove comments
        for (let k: number = 0; k < lines.length; k++)
        {
            if (lines[k].indexOf(this.comment_prefix) !== -1)
            {
                // Comment found, time to exterminate!
                lines[k] = lines[k].replace(/;(.*)/g, "");
            }
        }

        //Delete whitespace
        for (let k: number = lines.length; k >= 0; k--)
        {
            if (lines[k] == "" || !/\S/g.test(lines[k])) // check for empty lines & whitespace
            {
                // If its whitespace, remove it! >:)
                lines.splice(k, 1);
            }
        }

        for (let i: number = 0; i < lines.length; i++)
        {
            let opcode: string = "";
            // Get instruction

            // Check if instruction is contained, and if so, it will add it
            for (let inst: number = 0; inst < this.insts.length; inst++)
            {
                if (lines[i].indexOf(this.insts[inst]) !== -1)
                {
                    opcode += inst.toString(16); // Append instruction as hex string
                    break;
                }
            }

            if (opcode == "") //If opcode doesn't exist, thorw error!
            {
                this.log("Opcode not found!", i.toString(16), 1);
                return "error";
            }

            //Check if instruction requires operand
            let requiresOperand: boolean = true;
            for (let j: number = 0; j < this.no_operand.length; j++)
            {
                if (opcode == this.no_operand[j]) { requiresOperand = false; break; }
            }

            // Add operand
            if (requiresOperand)
            {
                if (lines[i].indexOf(this.address_prefix) !== -1)
                {
                    let numbers: string = lines[i].substr(lines[i].indexOf(this.address_prefix) + 1, 2); // Get operand
                    numbers = numbers.split("").reverse().join(""); // Reverse
                    opcode += numbers; // Add numbers
                }
                else
                {
                    this.log("No operand found!", i.toString(16), 1);
                    return "error";
                }
            }
            else
            {
                if (lines[i].indexOf(this.address_prefix) !== -1)
                {
                    this.log("No operand required!", i.toString(16), 2); // Give warning
                }
            }

            // Add final opcode to binary string
            binary += opcode;
        }

        this.log("Compilation complete!");

        return binary;        
    }    
}