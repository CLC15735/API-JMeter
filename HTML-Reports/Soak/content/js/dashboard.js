/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 98.37201505047871, "KoPercent": 1.6279849495212904};
    var dataset = [
        {
            "label" : "KO",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "OK",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.47693998435346274, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.8066022007335779, 500, 1500, "create a list"], "isController": false}, {"data": [0.017281879194630874, 500, 1500, "Read list"], "isController": false}, {"data": [0.7814685314685315, 500, 1500, "Delete list"], "isController": false}, {"data": [0.9997484065749749, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.09130592942888323, 500, 1500, "Update list"], "isController": false}, {"data": [0.0070969922271037515, 500, 1500, "Read tasks"], "isController": false}, {"data": [0.21637034552163703, 500, 1500, "Create a task"], "isController": false}, {"data": [0.5508390918065152, 500, 1500, "Delete task"], "isController": false}, {"data": [0.354233409610984, 500, 1500, "Update task"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 26843, 437, 1.6279849495212904, 16789.689900532754, 0, 101378, 942.0, 61431.9, 70761.95, 85551.92000000001, 51.54680748919827, 1930.939877880461, 9.607674102856457], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions\/s", "Received", "Sent"], "items": [{"data": ["create a list", 2999, 5, 0.16672224074691563, 2822.946982327444, 1, 80467, 3.0, 11030.0, 15830.0, 38611.0, 5.763295551942686, 1.913622376706024, 1.5646446908594402], "isController": false}, {"data": ["Read list", 2980, 148, 4.966442953020135, 40445.86744966429, 119, 100544, 42872.0, 71761.3, 81698.09999999999, 88535.04000000001, 5.804248788022212, 1359.523872346942, 1.054287377511847], "isController": false}, {"data": ["Delete list", 2002, 5, 0.24975024975024976, 1746.7867132867116, 1, 88947, 125.0, 1760.7000000000014, 3673.199999999999, 61236.0, 5.262148018283467, 0.9827485877033432, 1.1048044617206332], "isController": false}, {"data": ["Debug Sampler", 5962, 0, 0.0, 0.5130828581013085, 0, 1737, 0.0, 0.0, 0.0, 1.0, 11.648080274458625, 3.39043922867612, 0.0], "isController": false}, {"data": ["Update list", 2749, 18, 0.65478355765733, 31879.596944343375, 1, 98944, 31506.0, 62461.0, 69742.5, 84971.5, 5.543255134921499, 1.8455967487316451, 1.55359566437899], "isController": false}, {"data": ["Read tasks", 2959, 89, 3.0077728962487327, 48728.057113889816, 45, 101378, 49954.0, 76739.0, 82479.0, 92253.6, 5.780267779353563, 588.985426736107, 1.0386418666025934], "isController": false}, {"data": ["Create a task", 2981, 78, 2.616571620261657, 17190.56356927205, 2, 97421, 10200.0, 48471.8, 60064.200000000004, 79623.75999999994, 5.7952700798040375, 1.8305708060353627, 1.8166433732758538], "isController": false}, {"data": ["Delete task", 2026, 48, 2.3692003948667324, 3882.211253701869, 1, 86708, 587.5, 11323.499999999995, 17559.84999999999, 51511.69000000001, 4.90932529489876, 0.9252170319784628, 1.0207520690770662], "isController": false}, {"data": ["Update task", 2185, 46, 2.1052631578947367, 12474.624256292915, 2, 95713, 3912.0, 40844.600000000006, 48966.299999999996, 61693.83999999992, 4.881907004698696, 1.5207433569199076, 1.2725263666267475], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400", 5, 1.1441647597254005, 0.018626830086055954], "isController": false}, {"data": ["500", 334, 76.43020594965675, 1.244272249748538], "isController": false}, {"data": ["404", 98, 22.42562929061785, 0.3650858696866967], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 26843, 437, "500", 334, "404", 98, "400", 5, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["create a list", 2999, 5, "500", 5, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Read list", 2980, 148, "500", 148, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Delete list", 2002, 5, "404", 4, "500", 1, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["Update list", 2749, 18, "500", 14, "404", 4, null, null, null, null, null, null], "isController": false}, {"data": ["Read tasks", 2959, 89, "500", 89, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Create a task", 2981, 78, "500", 73, "400", 5, null, null, null, null, null, null], "isController": false}, {"data": ["Delete task", 2026, 48, "404", 45, "500", 3, null, null, null, null, null, null], "isController": false}, {"data": ["Update task", 2185, 46, "404", 45, "500", 1, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
