/* wap */
/* Jacob Johansson 2018 */
/*
Todo:
Finish compiler                         [x]
Finish emulator                         [ ]
Touch ups                               [ ]
Turn into library                       [ ]
Create editor                           [ ]
Create UI                               [ ]
*/
var wap = /** @class */ (function () {
    function wap() {
        // Init computer by filling RAM with zeros.
        this.RAM = new Array(256);
        this.ROM = "";
        this.AC = 0x00;
        this.PC = 0x00;
        // Carry, Zero, Data
        this.CARRY = false;
        this.ZERO = false;
        this.DATA = false;
        this.RUNNING = false;
        this.insts = ["hlt", "lda", "sta", "jmp", "spc", "and", "or", "add", "sub", "jnz", "cmp", "jnd", "jnc", "rol", "ror", "clf"]; // remove later
        for (var i = 0; i < this.RAM.length; i++) {
            this.RAM[i] = 0;
        } // LOL
    }
    wap.prototype.get_nn = function () {
        return parseInt("0x" + this.ROM[this.PC + 2] + this.ROM[this.PC + 1]);
    };
    wap.prototype.reset = function () {
        //this.ROM = "";
        this.AC = this.PC = 0x00;
        this.CARRY = this.ZERO = this.DATA = false;
        this.RUNNING = false;
        //for (let i = 0; i < this.RAM.length; i++) { this.RAM[i] = 0; } //Fill with zeros
    };
    wap.prototype.halt = function (reason) {
        if (reason === void 0) { reason = ""; }
        this.RUNNING = false;
        if (reason)
            reason = " (" + reason + ")";
        console.log("Computer halted at $0x" + this.PC.toString(16).toUpperCase() + reason);
        this.PC = 0x00;
    };
    wap.prototype.execute = function () {
        var jump = 0;
        console.log("Executing instruction 0x" + this.ROM[this.PC] + " (" + this.insts[parseInt("0x" + this.ROM[this.PC])] + ") at $0x" + this.PC.toString(16).toUpperCase());
        switch (this.ROM[this.PC]) {
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
                if (this.RAM[this.get_nn()] && this.AC) {
                    this.AC = 1;
                    this.ZERO = false;
                }
                else {
                    this.AC = 0;
                    this.ZERO = true;
                }
                jump = 3;
                break;
            case "6":
                if (this.RAM[this.get_nn()] || this.AC) {
                    this.AC = 1;
                    this.ZERO = false;
                }
                else {
                    this.AC = 0;
                    this.ZERO = true;
                }
                jump = 3;
                break;
            case "7":
                this.AC = this.AC + this.RAM[this.get_nn()];
                if (this.AC > 255) {
                    this.AC -= 255;
                    this.CARRY = true;
                }
                else {
                    this.CARRY = false;
                }
                if (this.AC === 0) {
                    this.ZERO = true;
                }
                else {
                    this.ZERO = false;
                }
                jump = 3;
                break;
            case "8":
                this.AC = this.AC - this.RAM[this.get_nn()];
                if (this.AC < 0) {
                    this.AC += 255;
                    this.CARRY = true;
                }
                else {
                    this.CARRY = false;
                }
                if (this.AC === 0) {
                    this.ZERO = true;
                }
                else {
                    this.ZERO = false;
                }
                jump = 3;
                break;
            case "9":
                if (!this.ZERO) {
                    console.log("Jumping to $0x" + this.get_nn().toString(16).toUpperCase());
                    this.PC = this.get_nn();
                }
                else
                    jump = 3;
                break;
            case "a":
            case "A":
                var TEMP = this.AC - this.RAM[this.get_nn()];
                if (TEMP < 0) {
                    TEMP += 255;
                    this.CARRY = true;
                }
                else {
                    this.CARRY = false;
                } // Reset carry
                if (TEMP === 0) {
                    this.ZERO = true;
                }
                else {
                    this.ZERO = false;
                } //Set or reset zero flag
                jump = 3;
                break;
            case "b":
            case "B":
                if (!this.DATA) {
                    console.log("Jumping to $0x" + this.get_nn().toString(16).toUpperCase());
                    this.PC = this.get_nn();
                }
                else
                    jump = 3;
                break;
            case "c":
            case "C":
                if (!this.CARRY) {
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
    };
    wap.prototype.load = function (url) {
        return "no";
    };
    return wap;
}());
var compiler = /** @class */ (function () {
    function compiler() {
        this.insts = ["hlt", "lda", "sta", "jmp", "spc", "and", "or", "add", "sub", "jnz", "cmp", "jnd", "jnc", "rol", "ror", "clf"];
        this.no_operand = ["0", "d", "e", "f"]; // commands that dont require an operand
        this.address_prefix = "$";
        this.comment_prefix = ";";
    }
    compiler.prototype.log = function (reason, location, type) {
        if (location === void 0) { location = "0"; }
        if (type === void 0) { type = 3; }
        switch (type) {
            case 1://Error
                console.error("Compilation error at 0x" + location.toUpperCase() + " (" + reason + ")");
                break;
            case 2://Warning
                console.warn("Compilation warning! " + reason + " (0x" + location.toUpperCase() + ")");
                break;
            case 3://Info
                console.log(reason);
                break;
        }
    };
    compiler.prototype.compile = function (file) {
        //Reset binary
        var binary = "";
        var lines = file.split(/\r?\n/); //Split every newline
        // Remove comments
        for (var k = 0; k < lines.length; k++) {
            if (lines[k].indexOf(this.comment_prefix) !== -1) {
                // Comment found, time to exterminate!
                lines[k] = lines[k].replace(/;(.*)/g, "");
            }
        }
        //Delete whitespace
        for (var k = lines.length; k >= 0; k--) {
            if (lines[k] == "" || !/\S/g.test(lines[k])) {
                // If its whitespace, remove it! >:)
                lines.splice(k, 1);
            }
        }
        for (var i = 0; i < lines.length; i++) {
            var opcode = "";
            // Get instruction
            // Check if instruction is contained, and if so, it will add it
            for (var inst = 0; inst < this.insts.length; inst++) {
                if (lines[i].indexOf(this.insts[inst]) !== -1) {
                    opcode += inst.toString(16); // Append instruction as hex string
                    break;
                }
            }
            if (opcode == "") {
                this.log("Opcode not found!", i.toString(16), 1);
                return "error";
            }
            //Check if instruction requires operand
            var requiresOperand = true;
            for (var j = 0; j < this.no_operand.length; j++) {
                if (opcode == this.no_operand[j]) {
                    requiresOperand = false;
                    break;
                }
            }
            // Add operand
            if (requiresOperand) {
                if (lines[i].indexOf(this.address_prefix) !== -1) {
                    var numbers = lines[i].substr(lines[i].indexOf(this.address_prefix) + 1, 2); // Get operand
                    numbers = numbers.split("").reverse().join(""); // Reverse
                    opcode += numbers; // Add numbers
                }
                else {
                    this.log("No operand found!", i.toString(16), 1);
                    return "error";
                }
            }
            else {
                if (lines[i].indexOf(this.address_prefix) !== -1) {
                    this.log("No operand required!", i.toString(16), 2); // Give warning
                }
            }
            // Add final opcode to binary string
            binary += opcode;
        }
        this.log("Compilation complete!");
        return binary;
    };
    return compiler;
}());
