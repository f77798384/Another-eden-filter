let characterData = [];
let modal = '';
let originPersonality = [];
let partyPersonality = [];
//資料載入
(async function(){
    const response = await fetch('./data/data.csv');
    const text = await response.text();
    characterData = Papa.parse(text,{header:true,skipEmptyLines:true}).data;
    characterData.sort(function(a,b){
        return Date.parse(b['實裝時間']) - Date.parse(a['實裝時間']);
    })
    let personality = '';
    characterData.forEach(function(items){
        if(items['個性'] != ''){
            personality +=`${items['個性']},`;
        }
        items['個性'] = items['個性'].split(',');
        items['頭銜'] = items['頭銜'].split(',');
        items['屬性'] = items['屬性'].split(',');
        items['天冥'] = items['天冥'].split(',');
        items['武器類型'] = items['武器類型'].split(',');
    })
    originPersonality = Array.from(new Set(personality.split(','))).slice(0,-1);
    PersonalityList();
    Comparison();
    datainitialization(characterData);
})();

(async function(){
    const response = await fetch('./data/Ptype.csv');
    const text = await response.text();
    Papa.parse(text,{fields:false,skipEmptyLines:true}).data.forEach(items =>{
        if(items){
            partyPersonality.push(items[0]);
        }
    })
})();



//監聽
$(' #selector').on('click',function(e){
    //紀錄modal
    e.preventDefault();
    modal = $(e.target).siblings('.modal');
})
$('.modal-body').on('click','#option',function (e) { 
    //篩選項目觸發
    e.preventDefault();
    $(e.target).toggleClass('active');
});
$('.modal').on('hidden.bs.modal',function(e){
    //復原篩選項目
    let modaltype = `#${modal.find('#submit').data('type')}`;
    let option = modal.find(' #option');
    let filter_items = $('#filter-items').find(modaltype).text().split(', ');
    modal.find('#reset').click();
    $.each(option,(index,items) => {
        filter_items.forEach(options =>{
            if(items.text.trim() == options){
                $(items).addClass('active');
            }
        })
    })
})
$('.modal-footer #reset').on('click',function (e) { 
    //重置
    e.preventDefault();
    $(e.target).parentsUntil('.modal').find(' #option').removeClass('active');
    //重置個性搜尋
    if($(e.target).siblings().data('type') == 'personality'){
        $('#resetSearch').click();
    }
});
$('.modal-footer #submit').on('click',function (e) { 
    //送出
    e.preventDefault();
    let str = [];
    $(e.target).parentsUntil('.modal').find(' #option.active').each(function (index,items) {
        str.push($(items).text().trim());
    })
    $(`#${$(e.target).data('type')}`).html(
        (str == '' ? '無篩選條件' : str.join(', '))
    )
    $('#personalitySearch').val('');
    PersonalityList();
    render();
});
$('#resetall').on('click',function (e) { 
    //全部重置
    e.preventDefault();
    $(' #reset').click();
    $(' #submit').click();
});
$('#personalitySearch').change(function(e){
    //搜尋個性
    Psearch($(e.target).val());
})
$('#resetSearch').click(function(e){
    //重置個性搜尋
    e.preventDefault();
    $(e.target).parentsUntil('.modal').find(' #option').parent().removeClass('d-none');
    $('#personalitySearch').val('');
})
$('#Ptype').click(function(){
    $(this).toggleClass('active');
    if($(this).hasClass('active')){
        $('#personalityModal #option.active').each((index,items) => {
            if(partyPersonality.includes($(items).text().trim())){
                return;
            }else{
                $(items).removeClass('active')
            }
        })
        $(' #submit').click();
        PersonalityList(partyPersonality);
    }else{
        PersonalityList();
    }
    render();
})

//資料刷新
function render(){
    if ($('#weapon').text() == '無篩選條件' && 
    $('#element').text() == '無篩選條件' && 
    $('#style').text() == '無篩選條件' && 
    $('#LStype').text() == '無篩選條件' && 
    $('#personality').text() == '無篩選條件'){
        datainitialization(characterData);
        return;
    }else{
        let renderdata = characterData.filter(items => (transform($('#element'),items['屬性']) &&
        transform($('#weapon'),items['武器類型']) &&
        transform($('#LStype'),items['天冥']) &&
        transform($('#style'),items['頭銜']) &&
        transform($('#personality'),items['個性'])
        ));
        datainitialization(renderdata);
    }
}
//條件篩選
function transform(condition,data){
    if(condition.text().trim() == '無篩選條件'){
        return true;
    }else{
        return condition.text().split(', ').some(a => data.includes(a));
    }
}
//components
function components(condition,data){
    let content = '';
    if(data != ''){
        data.forEach(function(items){
            if($('#Ptype').hasClass('active')){
                if(partyPersonality.includes(items)){
                    content += `
                    <span ${highlight(condition,items)} >${items}</span>
                    `;
                    return
                }
            }else{
                content += `
                <span ${highlight(condition,items)} >${items}</span>
                `;
                return
            }
        })
    }
    return content;
}
//highlight
function highlight(condition,data){
    if(condition.text().split(', ').some(a => data.includes(a))){
        return ` class="highlight"`;
    }else{
        return `class=""`;
    }
}
//篩選不重複
function Comparison(){
    let copy = true;
    characterData = characterData.filter((items,index,arr) => {
        if(items['頭銜'] == "AS" ){
            arr.forEach((a,i) => {
                if(a['角色中文名稱'] == items['角色中文名稱'] && a['頭銜']=='NS'){
                    let len = 0;
                    items['個性'].forEach(b => {
                        (a['個性'].find(c => c == b) ? len++ : '');
                    });
                    if(len == a['個性'].length && a['屬性'][0] == items['屬性'][0]){
                        characterData[i]['頭銜'].push(items['頭銜'][0]);
                        characterData[i]['實裝時間']=items['實裝時間'];
                        characterData[i]['星數']=items['星數'];
                        return copy = false;
                    }else{
                        return copy = true;
                    }
                }
            })
        }
        if(copy == true){
            return true;
        }else{
            copy = true;
            return false;
        }
    })
}
//資料初始化
function datainitialization(data){
    let display = '';
    data.forEach(function(items,index){
        display +=`
        <tr>
            <td>${items['角色中文名稱']}</td>
            <td>${components($('#style'),items['頭銜'])}</td>
            <td>${components($('#personality'),items['武器類型'])}</td>
            <td>
                ${components($('#element'),items['屬性'])}
            </td>
            <td>
                ${components($('#personality'),items['個性'])}
            </td>
        </tr>
        `;
    });
    $('#cha tbody').html(display);
}
//個性表單刷新
function PersonalityList(condition){
    let str = '';
    originPersonality.forEach(items => {
        if(condition && condition.includes(items)){
            str += `
            <div class="col">
                <a id="option"
                    class="btn btn-light border rounded-4 w-100 shadow-sm"
                    href="#" role="button">
                    ${items}
                </a>
            </div>
            `;
        }else if(condition == undefined){
            str += `
            <div class="col">
                <a id="option"
                    class="btn btn-light border rounded-4 w-100 shadow-sm"
                    href="#" role="button">
                    ${items}
                </a>
            </div>
            `;
        }
    })
    $('#personalityModal .modal-body .row').html(str);
}
//個性搜尋
function Psearch(condition){
    if(condition){
        $('#personalityModal .modal-body .row #option').each((index,items) => {
            if($(items).text().includes(condition) == false){
                $(items).parent().addClass('d-none');
            }
        })
        return;
    }else{
        $('#personalityModal .modal-body .row #option').each((index,items) => {
            $(items).parent().removeClass('d-none')
        })
    }
}