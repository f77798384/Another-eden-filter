let update = ''
let arr = []
let content = {}
let date = ''
let project = ''

$(document).ready(function () {
    $.ajax({
        url: "./data/course.txt",
        dataType: "text",
        success: function (update) {
            let i = 0;
            arr = update.split('\r')
            arr.forEach((item, index) => {
                if (item.startsWith('\n\t\t')) {
                    content[i - 1][project].push(item.trim())
                } else if (item.startsWith('\n\t')) {
                    project = item.trim()
                    content[i - 1][project] = [];
                } else {
                    date = item.trim()
                    content[i] = {}
                    content[i]['date'] = date;
                    i++
                }
            });
            let total = '';
            for (a = 0; a < Object.keys(content).length; a++) {
                let num = Object.keys(content[a]).length-1
                let string = '';
                Object.keys(content[a]).forEach((item,index) => {
                    let type = typeof (content[a][item])
                    switch (type) {
                        case 'string':
                            string += `<td rowspan="${num}">${content[a][item]}</td>`
                            break;
                        case 'object':
                            string += `${index>1?`<tr>`:''}<td>${item}</td><td><ul>`
                            content[a][item].forEach(b => {
                                string += `<li${b.search('done')>1?` class="done" `:``}>
                                ${b.search('done')>1? b.replace(`'done'`,''):b}</li>`
                            })
                            string += `</ul></td>${index>1?`</tr>`:''}`
                            break;
                        default:
                            break;
                    }
                })
                string = `<tr>${string}</tr>`
                total += string;
            }
            $('tbody').html(total)
        }
    });
});