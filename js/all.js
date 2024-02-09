let characterData = [];
let renderdata = [];
let display = '';
let cha = '';
//資料載入
(async function(){
    const response = await fetch('./data/data1.csv');
    const text = await response.text();
    characterData = Papa.parse(text,{header:true,skipEmptyLines:true}).data;
    characterData.forEach(function(items){
        items['個性'] = items['個性'].split(',')
        items['頭銜'] = items['頭銜'].split(',')
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
//監聽
$('.modal-body #option').click(function (e) { 
    e.preventDefault();
    $(e.target).toggleClass('active');
});
$('.modal-footer #reset').click(function (e) { 
    e.preventDefault();
    console.log('重置')
    $(e.target).parentsUntil('.modal').find(' #option').removeClass('active');
});
$('.modal-footer #submit').click(function (e) { 
    e.preventDefault();
    console.log('送出')
    let str = [];
    $(e.target).parentsUntil('.modal').find(' #option.active').each(function (index,element) {
        str.push($(element).text().trim())
    })
    $(`#${$(e.target).data('type')}`).html(
        (str == '' ? '無篩選條件' : str.join(', '))
    )
    render()
});
//資料刷新
function render(){
    renderdata = characterData.filter(function(items,index){
        if($('#weapon').text() != '無篩選條件' || $('#element').text() != '無篩選條件' || $('#style').text() != '無篩選條件' || $('#LStype').text() != '無篩選條件'){
            return (
                (transform($('#element'),items['屬性']) &&
                transform($('#weapon'),items['武器類型']) &&
                transform($('#LStype'),items['天冥']) &&
                transform($('#style'),items['頭銜'])
                )
            )
        }
    })
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
//條件篩選
function transform(condition,data){
    if(condition.text() == '無篩選條件'){
        return true
    }else{
        return condition.text().split(', ').some(a => data.includes(a))
    }
}
//
function highlight(condition,data){
    if(condition.text() == '無篩選條件'){
        return true
    }else{
        return condition.text().split(', ').some(a => data.includes(a))
    }
}
