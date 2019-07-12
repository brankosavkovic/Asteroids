
document.querySelector('#prikazi_asteroide').addEventListener('click', handleSubmit);
document.querySelector("#start_date").addEventListener('change', handleDateChange);
document.querySelector('#end_date').addEventListener('change', handleDateChange);
document.querySelector('#datum').addEventListener('click', () => sortTable('date'));
document.querySelector('#ime').addEventListener('click', () => sortTable('name'));
document.querySelector('#brzina').addEventListener('click', () => sortTable('speed'));
document.querySelector('#min_precnik').addEventListener('click', () => sortTable('min_diameter'));
document.querySelector('#max_precnik').addEventListener('click', () => sortTable('max_diameter'));


const table = document.querySelector('#table');
let current_sort;
let coef = 1;
const select = document.querySelector('#select');
const broj_prolazaka = document.querySelector('#broj_prolazaka');
let selfLinks = [];
let table_data = [];
const dates = {
    start_date: '',
    end_date: ''
}

function sortTable(field) {
    if (field === current_sort) coef = -coef;

    table_data = table_data.sort((a, b) => {
        if (a[field] === b[field]) return 0;
        if (isNaN(a[field]) && isNaN(b[field])) {
            return a[field] > b[field] ? coef : -1 * coef;
        } else {
            return Number(a[field]) > Number(b[field]) ? coef : -1 * coef;
        }
    });

    current_sort = field;
    createTable();
}

async function fetch_data() {
    const { start_date, end_date } = dates;

    const response = await fetch(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${start_date}&end_date=${end_date}&api_key=x0HeIJzRCLm3lj0zrfXt2LltusKVCO7aoHmRkVq2`)
        .then((resp) => resp.json())

    return response.near_earth_objects;
}

function handleDateChange(e) {
    const date = e.target.value;
    const name = e.target.name;
    dates[name] = date;

    var d1 = new Date(dates['start_date']);
    var d2 = new Date(dates['end_date']);

    if (d1 > d2) {
        alert('End date mora biti kasnije od Start date!');
    }

    if ((d2.getTime() - d1.getTime()) > 604799999) {
        alert("Vremenski period ne sme biti veci od 7 dana!")
    }
}

async function handleSubmit(e) {
    const date_1 = document.querySelector('#start_date').value;
    const date_2 = document.querySelector('#end_date').value;

    if (date_1 === '' || date_2 === '') {
        alert('Morate uneti oba datuma!')
    } else {
        const data = await fetch_data();
        table_data = parseData(data);
        table.style.visibility = "visible";
        const select = document.getElementById('select');
        if(select){
            select.style.visibility = "visible";
        }
        createTable();
        createSelect();
    }
}

function deleteTable() {
    var table = document.getElementById('table');
    var tableRows = table.getElementsByTagName('tr');
    var rowCount = tableRows.length;

    for (var x = rowCount - 1; x > 0; x--) {
        table.removeChild(tableRows[x]);
    }
}

function deleteSelect() {
    const select = document.getElementById('select');
    if (select){
        select.parentNode.removeChild(select);
    }
}

function parseData(data) {
    const result = [];
    Object.keys(data).forEach(date => {
        const daily = data[date];
        daily.forEach(item => {
            item.date = date;
            result.push(item);
        });
    })

    return result.filter(item => item.is_potentially_hazardous_asteroid).map(item => {
        return {
            date: item.date,
            name: item.name,
            speed: item.close_approach_data[0].relative_velocity.kilometers_per_hour,
            min_diameter: item.estimated_diameter.meters.estimated_diameter_min,
            max_diameter: item.estimated_diameter.meters.estimated_diameter_max,
            self: item.links.self,
        }
    });
}

function createSelect() {
    deleteSelect();

    const select = document.createElement('select');
    select.setAttribute('id', 'select');
    select.value = null;
    select.addEventListener('change', getSelectValue);
    const div1 = document.getElementById('div1');
    const select_data = table_data.filter((item) => !selfLinks.includes(item.self))
    const empty_option = document.createElement('option');
    empty_option.style.display = 'none';
    const empty_option_text = document.createTextNode('');
    empty_option.appendChild(empty_option_text);
    select.appendChild(empty_option);

    select_data.forEach(item => {
        const option = document.createElement('option');
        const option_text = document.createTextNode(item.name);
        option.appendChild(option_text);
        option.setAttribute('value', item.self);
        select.appendChild(option);
    });
    select.style.visibility = 'visible';
    div1.appendChild(select);
}

function createTable() {
    deleteTable();
    table_data.forEach(item => {
        const row = document.createElement('tr');
        const date_cell = document.createElement('td');
        const date_text = document.createTextNode(item.date);
        date_cell.appendChild(date_text);
        row.appendChild(date_cell);

        const name_cell = document.createElement('td');
        const name_text = document.createTextNode(item.name);
        name_cell.appendChild(name_text);
        row.appendChild(name_cell);

        const speed_cell = document.createElement('td');
        const speed_text = document.createTextNode(item.speed);
        speed_cell.appendChild(speed_text);
        row.appendChild(speed_cell);

        const min_diameter_cell = document.createElement('td');
        const min_diameter_text = document.createTextNode(item.min_diameter);
        min_diameter_cell.appendChild(min_diameter_text);
        row.appendChild(min_diameter_cell);

        const max_diameter_cell = document.createElement('td');
        const max_diameter_text = document.createTextNode(item.max_diameter);
        max_diameter_cell.appendChild(max_diameter_text);
        row.appendChild(max_diameter_cell);

        table.appendChild(row);
    })
}
let selected_links = [];
let i = 0;
function getSelectValue() {
    const selectedOption = document.querySelector('#select > option:checked');
    const selectedValue = selectedOption.innerText;
    const selected_url = selectedOption.value;
    selfLinks.push(selected_url);
    let ulList = document.querySelector('#ulList');
    const li = document.createElement('li');
    li.setAttribute('class', 'list-group-item');
    const li_text = document.createTextNode(selectedValue);
    li.appendChild(li_text);

    const btn = document.createElement('button');
    btn.setAttribute('class', 'btn btn-danger');
    btn.setAttribute('style', 'height:30px; line-height:30px;')
    btn.innerText = 'Delete';
    li.appendChild(btn);

    if (selectedValue != '') {

        ulList.appendChild(li);
        i++;
    }

    createSelect();
    if (i > 0) {
        broj_prolazaka.style.visibility = 'visible';
    } else {
        broj_prolazaka.visibility = 'hidden';
    }

    btn.onclick = function () {
        li.remove();
        selfLinks = selfLinks.filter(link => link !== selected_url);
        console.log(selfLinks)
        createSelect();
        i--;
        if (i == 0)
            broj_prolazaka.style.visibility = 'hidden';
    }
}










