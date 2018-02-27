/*
Awful code that doesn't really work
lol
*/

var comment = ";"
var inst = ["hlt", "lda", "sta", "jmp", "spc", "and", "or", "add", "sub", "jnz", "cmp", "jnd", "jnc", "rol", "ror", "clf"];
var num = "$";

var editor_window = document.getElementById("editor");

function clear_colors()
{

}

function update_colors()
{

    // Instruction
    for (i = 0; i < inst.length; i++) {

        if (get_text().indexOf(inst[i]) !== -1)
        {
            editor_window.innerHTML = get_text().split(inst[i]).join("<span class='inst'>" + inst[i] + "</span>");
        }
    }

    // Numbers
    if (get_text().indexOf(num) !== -1)
    {
        editor_window.innerHTML = get_text().split(num).join("<span class='num'>" + num + "</span>");
    }
}

function get_text()
{
    return editor_window.innerHTML;
}