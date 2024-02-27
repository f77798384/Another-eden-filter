let characterData = [];
let modal = '';
let originPersonality = [];
let partyPersonality = [];
//資料載入
(async function(){
    const response = await fetch('./data/data.csv');
    const text = await response.text();
    characterData = Papa.parse(text,{header:true,skipEmptyLines:true}).data;
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
        items['特殊條件'] = items['特殊條件'].split(',');
    })
    originPersonality = Array.from(new Set(personality.split(','))).slice(0,-1);
    PersonalityList();
    Comparison();
    specondition(characterData)
    characterData.sort(function(a,b){
        return Date.parse(b['實裝時間']) - Date.parse(a['實裝時間']);
    })
    render();
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
    let filter_items = $(this).parentsUntil('tbody').find(modaltype).text().split(', ');
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
    let display = [];
    $(e.target).parentsUntil('.modal').find(' #option.active').each(function (index,items) {
        display.push($(items).text().trim());
    })
    $(`#${$(e.target).data('type')}`).html(
        (display == '' ? '無篩選條件' : display.join(', '))
    );
    $('#personalitySearch').val('');
    console.log($(e.target).data('type'))
    if($(e.target).data('type')=='personality'){
        PersonalityList()
    }
    let tab = $('.nav-item .active').attr('id');
    switch(tab){
        case 'update':
            break;
        default:
            render();
            break;
    }
});
$('#resetall').on('click',function (e) { 
    //全部重置
    e.preventDefault();
    let tab = $('.nav-item .active').attr('id');
    $(`.${tab} #reset`).click();
    $(`.${tab} #submit`).click();
    if(tab == 'rtr'){
        $('#r-cha tbody').html('');
        $('#resetrolesearch').click();
    }
});
$('#personalitySearch').change(function(e){
    //搜尋個性
    Psearch($(e.target).val());
})
$('#resetSearch').click(function(e){
    //重置個性搜尋
    e.preventDefault();
    let tab = $('.nav-item .active').attr('id');
    if($(Ptype).hasClass('active')){
        $('#personalityModal #option').each((index,items) => {
            if(partyPersonality.includes($(items).text().trim()) == false){
                $(items).removeClass('active').parent().addClass('d-none');
            }
        })
        return;
    }else{
        $('#personalityModal #option').parent().removeClass('d-none');
    }
    $('#personalitySearch').val('');
})
$('#Ptype').click(function(){
    //P化清單
    let tab = $('.nav-item .active').attr('id');
    $(this).toggleClass('active');
    if($(this).hasClass('active')){
        $('#personalityModal #option').each((index,items) => {
            if(partyPersonality.includes($(items).text().trim()) == false){
                $(items).removeClass('active').parent().addClass('d-none');
            }
        })
        $(`.${tab} #submit`).click();
        return;
    }else{
        $('#personalityModal #option').parent().removeClass('d-none');
    }
    render();
})
$('#r-Ptype').click(function(){
    //P化清單
    $(this).toggleClass('active');
    rolePersonality(
        $(this).hasClass('active')? partyPersonality : '');
})
$('#roledataList').change(function(e){
    //角色名單選擇
    e.preventDefault();
    rolePersonality(
        $('#r-Ptype').hasClass('active')?partyPersonality:'')
})
$('#resetrolesearch').click(function(e){
    //rtr重置
    e.preventDefault();
    $('#roledataList').val('');
    $('#rolepersonality').html('');
    $('#r-cha tbody').html('');
})
$('.nav-item a').click(function(e){
    //tab switch
    e.preventDefault();
    let tab = $(this).attr('id');
    if($(this).hasClass('active')||tab =='resetall'){
        return;
    }else{
        $(this).addClass('active').parent().siblings().children('a').removeClass('active');
        $('main section').addClass('d-none');
        $(`.${tab}`).removeClass('d-none');
        return;
    }
})


//資料刷新
function render(){
    let tab = $('.nav-item .active').attr('id');
    let renderdata = '';
    if ($((tab == 'rtr' ? '#r-weapon' : '#weapon')
    ).text() == '無篩選條件' && 
    $((tab == 'rtr' ? '#r-element' : '#element')
    ).text() == '無篩選條件' && 
    $((tab == 'rtr' ? '#r-style' : '#style')
    ).text() == '無篩選條件' && 
    $((tab == 'rtr' ? '#r-LStype' : '#LStype')
    ).text() == '無篩選條件' && 
    (tab == 'rtr' ? true : $('#personality').text() == '無篩選條件')){
    }else{
        renderdata = characterData.filter(items => 
        (transform($((tab == 'rtr' ? '#r-element' : '#element')
        ),items['屬性']) &&
        transform($((tab == 'rtr' ? '#r-weapon' : '#weapon')
        ),items['武器類型']) &&
        transform($((tab == 'rtr' ? '#r-LStype' : '#LStype')
        ),items['天冥']) &&
        transform($((tab == 'rtr' ? '#r-style' : '#style')
        ),items['頭銜']) &&
        (tab == 'rtr' ? true : transform($('#personality'),items['個性']))
        ));
    }
    switch (tab){
        case 'rtr':
            roledataList((renderdata ? renderdata:characterData));
            break;
        case 'ctr':
            (renderdata ? datainitialization(renderdata):datainitialization(characterData));
                break;
        default:
            roledataList(characterData);
            datainitialization(characterData);
            break;
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
function components(condition,select,data){
    let tab = $('.nav-item .active').attr('id');
    let content = '';
    if(select != ''){
        select.forEach(function(items){
            switch (tab) {
                case 'rtr':
                    if($('#r-Ptype').hasClass('active')){
                        if(partyPersonality.includes(items)){
                            content += `
                            <span ${highlight(condition,items,data)}>${items}</span>
                            `;
                            return
                        }
                    }else{
                        content += `
                        <span ${highlight(condition,items,data)}>${items}</span>
                        `;
                        return
                    }
                    break;
                case 'ctr':
                    if($('#Ptype').hasClass('active')){
                        if(partyPersonality.includes(items)){
                            content += `
                            <span ${highlight(condition,items,data)}>${items}</span>
                            `;
                            return;
                        }
                    }else{
                        content += `
                        <span ${highlight(condition,items,data)}>${items}</span>
                        `;
                        return;
                    }
                    break;
                default:
                    content += `
                        <span ${highlight(condition,items,data)}>${items}</span>
                        `;
                    break;
            }
        })
    }
    return content;
}
//highlight
function highlight(condition,items,data){
    let str = '';
    let cla = '';
    if(data){
        if(data['特殊條件'][0] != ''){
            data['特殊條件'].some(a => {
                let key = Object.keys(a)
                if(items == key){
                    cla += ` tips `
                    str += `data-bs-toggle="tooltip" title="${a[key]}"`;
                }
            })
        }
    }
    if(condition.some(a => items.includes(a))){
        cla += ` highlight `;
    }
    return `class="${cla}" ${str}`;
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
                        characterData[i]['特殊條件']=items['特殊條件'];
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
    let tab = $('.nav-item .active').attr('id')
    let display = '';
    switch (tab) {
        case 'rtr':
            data.forEach(items => {
                display+=`<option value="${items['角色中文名稱']} ${items['頭銜']}">
                </option>`;
            });
            $('#datalistOptions').html(display);
            break;
        case 'ctr':
            data.forEach(function(items,index){
                display +=`
                <tr>
                    <td>${items['角色中文名稱']}</td>
                    <td>${components($('#style').text().split(', '),items['頭銜'])}</td>
                    <td>${components($('#weapon').text().split(', '),items['武器類型'])}</td>
                    <td>
                        ${components($('#element').text().split(', '),items['屬性'])}
                    </td>
                    <td>
                        ${components($('#personality').text().split(', '),items['個性'],items)}
                    </td>
                </tr>
                `;
            });
            $('#cha tbody').html(display);
            break;
        default :
            data.forEach(function(items,index){
                display +=`
                <tr>
                    <td>${items['角色中文名稱']}</td>
                    <td>${components($('#style').text().split(', '),items['頭銜'])}</td>
                    <td>${components($('#weapon').text().split(', '),items['武器類型'])}</td>
                    <td>
                        ${components($('#element').text().split(', '),items['屬性'])}
                    </td>
                    <td>
                        ${components($('#personality').text().split(', '),items['個性'],items)}
                    </td>
                </tr>
                `;
            });
            $('#cha tbody').html(display);
            break;
    }
    tooltipOn()
}
//個性表單刷新
// function PersonalityList(condition){
//     let display = '';
//     originPersonality.forEach(items => {
//         if((condition && condition.includes(items))||condition == undefined){
//             display += `
//             <li class="col">
//                 <a id="option"
//                     class="btn btn-light border rounded-4 w-100 shadow-sm"
//                     href="#" role="button">
//                     ${items}
//                 </a>
//             </li>
//             `;
//         }
//     })
//     $('#personalityModal .modal-body .row').html(display);
// }
function PersonalityList(condition){
    let prefix = `
    <li class="col">
        <a id="option"
            class="btn btn-light border rounded-4 w-100 shadow-sm"
            href="#" role="button">
    `
    let arr = [];
    let display = '';
    let active = [];
    $('#personalityModal #option.active').each((index,items) => {
        active.push($(items).html().trim())        
    })
    originPersonality.forEach(items => {
        if((condition && condition.includes(items))||condition == undefined){
            if(active.includes(items)){
                arr.unshift(prefix + items)
            }else{
                arr.push(prefix + items)
            }
        }
    })
    display = arr.join(`
    </a>
        </li>
    `)
    $('#personalityModal .modal-body .row').html(display);
}
//個性搜尋
function Psearch(condition){
    if(condition){
        $('#personalityModal .modal-body .row #option').each((index,items) => {
            if($(items).text().includes(condition) == false){
                $(items).parent().addClass('d-none');
            }
        });
        return;
    }else{
        $('#personalityModal .modal-body .row #option').each((index,items) => {
            $(items).parent().removeClass('d-none')
        });
    }
}
//角色名單刷新
function roledataList(data){
    let display = '';
    data.forEach(items => {
        display+=`<option value="${items['角色中文名稱']} ${items['頭銜']}">
        </option>`;
    });
    $('#datalistOptions').html(display);
}
//角色個性集合
function rolePersonality(condition){
    let role = characterData.find(items => $('#roledataList').val().includes(items['角色中文名稱']) && $('#roledataList').val().includes(items['頭銜']));
    let index = characterData.findIndex(items => $('#roledataList').val().includes(items['角色中文名稱']) && $('#roledataList').val().includes(items['頭銜']));
    let display = '';
    let arr = [];
    if(role){
        role['屬性'].forEach(items => {
            display +=`
            <span>${items}</span>
            `;
            arr.push(items);
        })
        role['武器類型'].forEach(items => {
            display +=`
            <span>${items}</span>
            `;
            arr.push(items);
        })
        role['個性'].forEach(items => {
            if(condition){
                if(condition.includes(items)){
                    display +=`
                    <span>${items}</span>
                    `;
                    arr.push(items);
                }
            }else{
                display +=`
                <span>${items}</span>
                `;
                arr.push(items);
            }
        })
    }else{
        return;
    }
    rtrList(arr,role,index);
    $('#rolepersonality').html(display);
    tooltipOn()
}
function rtrList(arr,role,index){
    let renderdata = '';
    let display = '';
    renderdata = characterData.filter((items,i) => {
        return (
            (items['屬性'].some(a => arr.includes(a)) ||
            items['武器類型'].some(a => arr.includes(a)) ||
            items['個性'].some(a => arr.includes(a))) && items['角色中文名稱'] != role['角色中文名稱']
        );
    })
    
    renderdata.forEach(items => {
        let count = 0;
        items['屬性'].forEach(a => arr.includes(a) ? count++ : '')
        items['武器類型'].forEach(a => arr.includes(a) ? count++ : '')
        items['個性'].forEach(a => arr.includes(a) ? count++ : '')
        items['sort'] = count
    })

    renderdata.sort((a,b) => b['sort'] - a['sort'])

    renderdata.forEach(function(items,index){
        display +=`
        <tr>
            <td>${items['角色中文名稱']}</td>
            <td>${components(['none'],items['頭銜'])}</td>
            <td>${components(role['武器類型'],items['武器類型'])}</td>
            <td>
                ${components(role['屬性'],items['屬性'])}
            </td>
            <td>
                ${components(role['個性'],items['個性'],items)}
            </td>
        </tr>
        `;
    });
    $('#r-cha tbody').html(display);
    tooltipOn()
}
function specondition(data){
    data.forEach((items,index) => {
        items['特殊條件'].forEach((a,b) => {
            let perLen = a.indexOf(':');
            let per = a.substring(0,perLen)
            let content = a.substring(perLen+1,a.length)
            if(perLen > 0){
                data[index]['特殊條件'][b] = {[per]:content}
            }
        })
    })
}
function tooltipOn(){
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
    })
}