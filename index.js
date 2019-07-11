
document.querySelector('#prikazi_asteroide').addEventListener('click', handleSubmit);
document.querySelector("#start_date").addEventListener('change', handleDateChange);
document.querySelector('#end_date').addEventListener('change', handleDateChange);
const table = document.querySelector('#table');
const select = document.querySelector('#select');
const broj_prolazaka = document.querySelector('#broj_prolazaka');

const table_data = [];
const dates = {
    start_date: '',
    end_date: ''
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
        deleteTable();
        const data = await fetch_data();
        const parsed = parseData(data);
        table.style.visibility = "visible";
        select.style.visibility = "visible";
        createTable(parsed);
        createSelect(parsed);
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
        }
    });
}

function createSelect(array) {

    const empty_option = document.createElement('option');
    const empty_option_text = document.createTextNode('');
    empty_option.appendChild(empty_option_text);
    select.appendChild(empty_option);

    array.forEach(item => {
        const option = document.createElement('option');
        const option_text = document.createTextNode(item.name);
        option.appendChild(option_text);
        select.appendChild(option);
    });

}

function createTable(array) {
    array.forEach(item => {
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

let i = 0;
function getSelectValue() {
    
    let selectedValue = document.querySelector('#select').value;
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
   
 

  

    if (i > 0) {
        broj_prolazaka.style.visibility = 'visible';
    } else {
        broj_prolazaka.visibility = 'hidden';
    }

    btn.onclick = function () {
        li.remove();
        i--;
        if (i == 0)
            broj_prolazaka.style.visibility = 'hidden';
    }
}


th = document.getElementsByTagName('th');

//Sortiranje prve dve kolone kao sortiranje stringova

for (let c = 0; c < 2; c++) {
    th[c].addEventListener('click', sortColumn(c));
}

function sortColumn(c) {
    return function () {
        sortTable(c);
        console.log(c);
    }
}

function sortTable(c) {
    var table, rows, switching, i, x, y, shouldSwitch;
    table = document.getElementById('table');
    switching = true;

    while (switching) {
        switching = false;
        rows = table.rows;

        for (i = 1; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            x = rows[i].getElementsByTagName('td')[c];
            y = rows[i + 1].getElementsByTagName('td')[c];

            if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                shouldSwitch = true;
                break;
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
        }
    }
}

//Sortiranje poslednje tri kolone

for (let m = 2; m < th.length; m++) {
    th[m].addEventListener('click', sort(m));
}

function sort(m) {
    return function () {
        sort_number(m);
        console.log(m);
    }
}

function sort_number(m) {
    var table, rows, switching, i, x, y, shouldSwitch;
    table = document.getElementById('table');
    switching = true;

    while (switching) {
        switching = false;
        rows = table.rows;

        for (i = 1; i < (rows.length - 1); i++) {
            x = rows[i].getElementsByTagName('td')[m];
            y = rows[i + 1].getElementsByTagName('td')[m];

            if (parseFloat(x.innerHTML) > parseFloat(y.innerHTML)) {
                shouldSwitch = true;
                break;
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
        }
    }
}







