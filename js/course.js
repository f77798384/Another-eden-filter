let update = ''
let arr = []
let content = {}
let date = ''
let project = ''

$(document).ready(function () {
    $.ajax({
        url: "./data/course.txt?=20250320",
        dataType: "text",
        success: function (update) {
            let i = 0;
            arr = update.toString().replaceAll('\r','').split('\n')
            arr.forEach((item, index) => {
                if (item.startsWith('\t\t')) {
                    content[i - 1][project].push(item.trim())
                } else if (item.startsWith('\t')) {
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
            $('.update tbody').html(total)
        }
    });
});