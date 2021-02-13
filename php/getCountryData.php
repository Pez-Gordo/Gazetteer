<?php

 

    // ini_set('display_errors', 'On');

    // error_reporting(E_ALL);

 

    $executionStartTime = microtime(true);

 

    // get country border feature

 

    $countryBorders = json_decode(file_get_contents("../json/countries_large.geo.json"), true);

 

    $border = null;

 

    foreach ($countryBorders['features'] as $feature) {

 

        if ($feature["properties"]["ISO_A3"] ==  $_REQUEST['countryCode']) {

 

            $border = $feature;

            break;

        

        }

        

    }

 

    // get API data

 

    // first API: geonames countryInfo

 

    $url='http://api.geonames.org/countryInfoJSON?formatted=true&lang=' . $_REQUEST['lang'] . '&country=' . $_REQUEST['country'] . '&username=flightltd&style=full';

 

    $ch = curl_init();

    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    curl_setopt($ch, CURLOPT_URL,$url);

 

    $result=curl_exec($ch);

 

    curl_close($ch);

 

    $countryInfo = json_decode($result,true);

 

    // subsequent APIs: 

    //repeat first API code block for each API and store to descriptively named variable as per “$countryInfo”

 

    $output['status']['code'] = "200";

    $output['status']['name'] = "ok";

    $output['status']['description'] = "success";

    $output['status']['executedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";

    $output['data']['border'] = $border;

    $output['data']['countryInfo'] = $countryInfo;

    //repeat above line for each API result’s variable

 

    header('Content-Type: application/json; charset=UTF-8');

 

    echo json_encode($output);

 

?>