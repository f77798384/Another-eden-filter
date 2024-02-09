$('#more').click(function (e) { 
    e.preventDefault();
    $(' #collapseth').toggleClass('more');
});

let characterData = [];
let renderdata = [];
let display = '';
let cha = '';
(async function(){
    const response = await fetch('../data/data.csv');
    const text = await response.text();
    characterData = Papa.parse(text,{header:true}).data;
    characterData.forEach(function(items){
        items['個性'] = items['個性'].split(',')
        items['屬性'] = items['屬性'].split(',')
        items['天冥'] = items['天冥'].split(',')
        items['武器類型'] = items['武器類型'].split(',')
    })
    characterData.forEach(function(items){
        cha = '';
        ele = '';
        if(items['屬性'] != ''){
            items['屬性'].forEach(function(items){
                ele += `
                <span>${items}</span>
                `
            })
        }
        if(items['個性'] != ''){
            items['個性'].forEach(function(items){
                cha += `
                <span>${items}</span>
                `
            })
        }
        display +=`
        <tr>
            <td>${items['角色中文名稱']}</td>
            <td>${items['武器類型']}</td>
            <td>
                ${ele}
            </td>
            <td>
                ${cha}
            </td>
        </tr>
        `
    });
    $('#cha tbody').html(display)
})();


$('.modal-body #option').click(function (e) { 
    e.preventDefault();
    console.log($(e.target).text().trim());
    $(e.target).toggleClass('active');
});
$('.modal-footer #reset').click(function (e) { 
    e.preventDefault();
    console.log('重置');
    $(e.target).parentsUntil('.modal').find(' #option').removeClass('active');
});
$('.modal-footer #submit').click(function (e) { 
    e.preventDefault();
    let str = [];
    console.log('送出');
    $(e.target).parentsUntil('.modal').find(' #option.active').each(function (index,element) {
        str.push($(element).text().trim())
    })
    $(`#${$(e.target).data('type')}`).html(
        (str == '' ? '無篩選條件' : str.join(', '))
    )
    render()
});
function render(){
    renderdata = characterData.filter(function(items,index){
        if($('#weapon').text() != '無篩選條件' || $('#element').text() != '無篩選條件' || $('#style').text() != '無篩選條件' || $('#LStype').text() != '無篩選條件'){
            return (
                (transform($('#element'),items['屬性']) &&
                transform($('#weapon'),items['武器類型']) &&
                transform($('#LStype'),items['天冥'])
                )
            )
        }
    })
    console.log(renderdata)
    display = '';
    renderdata.forEach(function(items){
        cha = '';
        ele = '';
        if(items['屬性'] != ''){
            items['屬性'].forEach(function(items){
                ele += `
                <span>${items}</span>
                `
            })
        }
        if(items['個性'] != ''){
            items['個性'].forEach(function(items){
                cha += `
                <span>${items}</span>
                `
            })
        }
        display +=`
        <tr>
            <td>${items['角色中文名稱']}</td>
            <td>${items['武器類型']}</td>
            <td>
                ${ele}
            </td>
            <td>
                ${cha}
            </td>
        </tr>
        `
    });
    $('#cha tbody').html(display)
}
function transform(condition,data){
    if(condition.text() == '無篩選條件'){
        return true
    }else{
        return condition.text().split(', ').some(a => data.includes(a))
    }
}