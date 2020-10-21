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

    var data = {"OkPercent": 98.8890579820423, "KoPercent": 1.110942017957693};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5616344544209405, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.36256906077348067, 500, 1500, "create a list"], "isController": false}, {"data": [0.04111842105263158, 500, 1500, "Read list"], "isController": false}, {"data": [0.4608150470219436, 500, 1500, "Delete list"], "isController": false}, {"data": [0.9945722970039079, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.47838899803536344, 500, 1500, "Update list"], "isController": false}, {"data": [0.19507575757575757, 500, 1500, "Read tasks"], "isController": false}, {"data": [0.4683641975308642, 500, 1500, "Create a task"], "isController": false}, {"data": [0.35585585585585583, 500, 1500, "Delete task"], "isController": false}, {"data": [0.32274590163934425, 500, 1500, "Update task"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 6571, 73, 1.110942017957693, 2135.210926799569, 0, 32167, 608.0, 4819.0, 11789.4, 23764.559999999998, 46.44833850525556, 2654.81915704589, 7.3273009457902445], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions\/s", "Received", "Sent"], "items": [{"data": ["create a list", 724, 0, 0.0, 1845.273480662984, 3, 30391, 1644.0, 3480.0, 4537.25, 10851.25, 5.142593316049295, 1.7125237507546969, 1.3961337322868204], "isController": false}, {"data": ["Read list", 608, 8, 1.3157894736842106, 5805.674342105261, 427, 32167, 3209.5, 14181.0, 20916.99999999981, 30163.29, 4.304638105959233, 1447.7307199516083, 0.7818971559652514], "isController": false}, {"data": ["Delete list", 319, 0, 0.0, 2306.85579937304, 2, 30386, 1036.0, 4998.0, 11167.0, 21988.40000000002, 2.4800006219437294, 0.4625782410070824, 0.5231251311912555], "isController": false}, {"data": ["Debug Sampler", 2303, 0, 0.0, 25.988710377768086, 0, 2528, 2.0, 23.59999999999991, 134.0, 457.8000000000002, 16.650279071112525, 810.1312096824481, 0.0], "isController": false}, {"data": ["Update list", 509, 3, 0.5893909626719057, 2222.3398821218066, 3, 31324, 1026.0, 5037.0, 9544.0, 23736.399999999994, 3.823330579133178, 1.2770867174002856, 1.0753117253812063], "isController": false}, {"data": ["Read tasks", 528, 53, 10.037878787878787, 3559.5113636363626, 251, 30222, 1783.0, 11090.7, 14678.949999999993, 25221.710000000003, 3.8175113874629454, 420.26340003886196, 0.685959077434748], "isController": false}, {"data": ["Create a task", 648, 1, 0.15432098765432098, 1856.1435185185173, 2, 30206, 1043.0, 3407.3, 5999.849999999996, 21683.79999999998, 4.616535461119225, 1.4608189474762225, 1.4516840024222561], "isController": false}, {"data": ["Delete task", 444, 3, 0.6756756756756757, 4143.0743243243305, 2, 30477, 1755.5, 11824.0, 14315.75, 23699.500000000004, 3.4612056533025672, 0.6491587672183288, 0.7233379002019037], "isController": false}, {"data": ["Update task", 488, 5, 1.0245901639344261, 4745.911885245901, 2, 31108, 1920.5, 13670.1, 22715.799999999996, 30178.890000000003, 3.6841310584327345, 1.1558471661256227, 0.9642061754491922], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500", 73, 100.0, 1.110942017957693], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 6571, 73, "500", 73, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["Read list", 608, 8, "500", 8, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Update list", 509, 3, "500", 3, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Read tasks", 528, 53, "500", 53, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Create a task", 648, 1, "500", 1, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Delete task", 444, 3, "500", 3, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Update task", 488, 5, "500", 5, null, null, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
