import json
import unittest
import requests

url = 'http://localhost:8888/users/statistics' #Endpoint for stats
headers = {'Accept': 'application/json'}

#Try to load test user JSON and output error message if unavailable
try:
    with open('/test_data/users.json') as file:
        user_json = json.load(file)
except:
    print('\nCannot load user data from "users.json".\n')

#Try to connect to API and output error message if unavailable
try:
    res = (requests.post(url, json=user_json, headers=headers))
    res_body = res.content
    res_dict = json.loads(res_body)
except:
    print("\nCannot connect to API.\n")

class TestApi(unittest.TestCase):
    #Test successful post request
    def test_api_request(self): 
        status = (res.status_code)
        self.assertEqual(status, 200)

    #Test post request with unacceptable header returns 406 code
    def test_unacceptable_header(self):
        test_header = {'Accept': 'application/ecmascript'}
        res = (requests.post(url, json=user_json, headers=test_header))
        self.assertEqual(res.status_code, 406)

    #Test female vs male percentage
    def test_female_percentage(self):
        stat_split = res_dict['1'].split()
        self.assertEqual(stat_split[4], '58.3%.')

    #Test AM vs NZ first names
    def test_first_names(self):
        stat_split = res_dict['2'].split()
        self.assertEqual(stat_split[10], '55.6%,')
        self.assertEqual(stat_split[11], '3')
    
    #Test AM vs NZ last names
    def test_last_names(self):
        stat_split = res_dict['3'].split()
        self.assertEqual(stat_split[10], '88.9%,')
        self.assertEqual(stat_split[11], '3')
        
    #Test state population percentages for all people
    def test_total_state_pops(self):
        stat_split = res_dict['4'].split(':', 1) #Split output by first colon
        self.assertEqual(stat_split[1], ' Roscommon: 8.3%, Queensland: 8.3%, Taranaki: 8.3%, خراسان رضوی: 8.3%, Santa Catarina: 8.3%, آذربایجان شرقی: 8.3%, Graubünden: 8.3%, Oxfordshire: 8.3%, قم: 8.3%, Alagoas: 8.3%')

    #Test state populations percentages for females
    def test_female_state_pops(self):
        stat_split = res_dict['5'].split(':', 1) #Split output by first colon
        self.assertEqual(stat_split[1], ' Roscommon: 14.3%, Queensland: 14.3%, Taranaki: 14.3%, Graubünden: 14.3%, Oxfordshire: 14.3%, Alagoas: 14.3%, Cantabria: 14.3%')

    #Test state populations percentages for males
    def test_male_state_pops(self):
        stat_split = res_dict['6'].split(':', 1) #Split output by first colon
        self.assertEqual(stat_split[1], ' خراسان رضوی: 20.0%, Santa Catarina: 20.0%, آذربایجان شرقی: 20.0%, قم: 20.0%, Michigan: 20.0%')

    #Test age range populations
    def test_age_pops(self):
        stat_split = res_dict['7'].split()
        self.assertEqual(stat_split[9], '66.7%,') #41-60
        self.assertEqual(stat_split[11], '25.0%,') #21-40
        self.assertEqual(stat_split[13], '8.3%') #61-80

if __name__ == '__main__':
    unittest.main()