<?php

$curl = curl_init();

curl_setopt_array($curl, [
	
	CURLOPT_URL => "https://newscatcher.p.rapidapi.com/v1/latest_headlines?topic=news&country=" . $_REQUEST['newsCountry'] ."&media=True",
	CURLOPT_RETURNTRANSFER => true,
	CURLOPT_FOLLOWLOCATION => true,
	CURLOPT_ENCODING => "",
	CURLOPT_MAXREDIRS => 10,
	CURLOPT_TIMEOUT => 30,
	CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
	CURLOPT_CUSTOMREQUEST => "GET",
	CURLOPT_HTTPHEADER => [
		"x-rapidapi-host: newscatcher.p.rapidapi.com",
		"x-rapidapi-key: af02c38f67mshaf5c1488ce77af0p1eda37jsn9a125f0e3241"
	],
]);

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
	echo "cURL Error #:" . $err;
} else {
	echo $response;
}