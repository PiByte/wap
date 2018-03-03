// Runtime for wap

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
        this.ROM = "0";


        this.AC = this.PC = 0x00;
        this.CARRY = this.ZERO = this.DATA = false;
        this.RUNNING = false;

        for (let i = 0; i < this.RAM.length; i++) { this.RAM[i] = 0; } //Fill with zeros
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
}