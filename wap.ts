class wap
{
    private RAM: Array<number> = new Array(256);

    private ROM: string = "";

    private AC: number = 0x00;
    private PC: number = 0x00;

    // Carry, Zero, Data
    private CARRY: boolean = false;
    private ZERO: boolean = false;
    private DATA: boolean = false;

    private RUNNING: boolean = false;

    private insts: Array<string> = ["hlt", "lda", "sta", "jmp", "spc", "and", "or", "add", "sub", "jnz", "cmp", "jnd", "jnc", "rol", "ror", "clf"];

    public constructor()
    {
        // Init computer by filling RAM with zeros.

        for (let i = 0; i < this.RAM.length; i++) { this.RAM[i] = 0; } // LOL
    }

    private get_nn(): number
    {
        return parseInt("0x" + this.ROM[this.PC + 2] + this.ROM[this.PC + 1]);
    }

    public reset(): void
    {
        //this.ROM = "";
        this.AC = this.PC = 0x00;
        this.CARRY = this.ZERO = this.DATA = false;
        this.RUNNING = false;

        //for (let i = 0; i < this.RAM.length; i++) { this.RAM[i] = 0; } //Fill with zeros
    }

    private halt(reason: string = ""): void
    {
        this.RUNNING = false;
        if (reason)
            reason = " (" + reason + ")"
        
        console.log("Computer halted at $0x" + this.PC.toString(16).toUpperCase() + reason);

        this.PC = 0x00;
    }

    public execute(): void
    {
        let jump: number = 0;

        console.log("Executing instruction 0x" + this.ROM [ this.PC ] + " (" + this.insts[ parseInt("0x" + this.ROM[ this.PC ] ) ]  + ") at $0x" + this.PC.toString(16).toUpperCase());

        switch (this.ROM [ this.PC ])
        {
            case "0":
                // Halt
                this.halt();
            break;
            case "1":
                this.AC = this.RAM[this.get_nn()];
                jump = 3;
            break;
            case "2":
                this.RAM[this.get_nn()] = this.AC;
                jump = 3;
            break;
            case "3":
                // jump
                console.log("Jumping to $0x" + this.get_nn().toString(16).toUpperCase());
                this.PC = this.get_nn();
            break;
            case "4":
                this.RAM[this.get_nn()] = this.PC;
                jump = 3;
            break;
            case "5":
                if (this.RAM[this.get_nn()] && this.AC)
                {
                    this.AC = 1;
                    this.ZERO = false;
                }
                else
                {
                    this.AC = 0;
                    this.ZERO = true;
                }
                    
                jump = 3;
            break;
            case "6":
                if (this.RAM[this.get_nn()] || this.AC)
                {
                    this.AC = 1;
                    this.ZERO = false;
                }
                else
                {
                    this.AC = 0;
                    this.ZERO = true;
                }
                    
                jump = 3;
            break;
            case "7":
                this.AC = this.AC + this.RAM[this.get_nn()];
                if (this.AC > 255)
                {
                    this.AC -= 255;
                    this.CARRY = true;
                } else { this.CARRY = false; }
                if (this.AC === 0) { this.ZERO = true; } else { this.ZERO = false; }
                jump = 3;
            break;
            case "8":
                this.AC = this.AC - this.RAM[this.get_nn()];
                if (this.AC < 0)
                {
                    this.AC += 255;
                    this.CARRY = true;
                } else { this.CARRY = false; }
                if (this.AC === 0) { this.ZERO = true; } else { this.ZERO = false; }
                jump = 3;
            break;
            case "9":
                if (!this.ZERO)
                {
                    console.log("Jumping to $0x" + this.get_nn().toString(16).toUpperCase());
                    this.PC = this.get_nn();
                }
                else
                    jump = 3;
            break;
            case "a":
            case "A":
                let TEMP: number = this.AC - this.RAM[this.get_nn()];
                if (TEMP < 0)
                {
                    TEMP += 255;
                    this.CARRY = true;
                } else { this.CARRY = false; } // Reset carry

                if (TEMP === 0) { this.ZERO = true; } else { this.ZERO = false; } //Set or reset zero flag
                jump = 3;
            break;
            case "b":
            case "B":
                if (!this.DATA)
                {
                    console.log("Jumping to $0x" + this.get_nn().toString(16).toUpperCase());
                    this.PC = this.get_nn();
                }
                else
                    jump = 3;
            break;
            case "c":
            case "C":
                if (!this.CARRY)
                {
                    console.log("Jumping to $0x" + this.get_nn().toString(16).toUpperCase());
                    this.PC = this.get_nn();
                }
                else
                    jump = 3;
            break;
            case "d":
            case "D":
                this.AC *= 2;
                jump = 1;
            break;
            case "e":
            case "E":
                this.AC /= 2;
                jump = 1;
            break;
            case "f":
            case "F":
                this.CARRY = this.ZERO = this.DATA = false;
                jump = 1;
            break;
            case undefined:
                this.halt("Undefined Instruction");
            break;
            default:
                this.halt("Illegal Instruction");
            break;
        }

        this.PC += jump;
    }

    public load(url: string): string
    {
        return "no";
    }
}

class compiler
{
    private file: string = `
        lda $00 ; Load first number
        add $01 ; Add
        sta $00 ; Save number
        lda $ff ;\
        sta $01 ; Cleanup
        clf     ;/
        hlt     ; Halt computer
    `; //Multiline string

    private binary: string = "";
    private insts: Array<string> = ["hlt", "lda", "sta", "jmp", "spc", "and", "or", "add", "sub", "jnz", "cmp", "jnd", "jnc", "rol", "ror", "clf"];    
    private no_operand: Array<string> = ["0", "d", "e", "f"];
    
    private address_prefix: string = "$";
    private comment_prefix: string = ";";

    public constructor()
    {

    }

    private compile_error(reason: string): void
    {
        console.error("Compilation error! (" + reason + ")");
    }

    public compile(): void
    {
        let lines: Array<string> = this.file.split(/\r?\n/); //Split every newline

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
                }
            }

            // Check if instruction requires an operand, and adds it.
            for (let j: number = 0; i < this.no_operand.length; i++)
            {
                if (opcode != this.no_operand[j])
                {
                    // If it requires operand

                    if (lines[i].indexOf(this.address_prefix))
                    {
                        let numbers: string = lines[i].substring(lines[i].indexOf(this.address_prefix) + 1, lines[i].indexOf(this.address_prefix) + 3);
                        numbers.split("").reverse().join(); //Reverse string
                        opcode += numbers; // Add numbers
                    }
                    else
                    {
                        this.compile_error("Missing operand or " + this.address_prefix + " symbol");
                        return;
                    }

                }
                else
                {
                    // If it doesn't

                }
            }

            //Comments


            // Add final opcode to binary string
            this.binary += opcode;
        }

        console.log(this.binary);

    }
}