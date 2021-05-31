const axios = require('axios')
const cron = require('node-cron')

const futureDates = (limit) => {
  const m2 = (number) => {
    if (number.toString().length === 1) {
      number = '0' + number
    }
    return number
  }

  let date = new Date().getDate() + 1
  let month = new Date().getMonth() + 1
  let year = new Date().getFullYear()

  const dim = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

  const dates = []

  for (let i = 0; i < limit; i++) {
    if (date < dim[month] + 1) {
      dates.push(m2(date) + '-' + m2(month) + '-' + year)
      date += 7
    } else {
      date -= dim[month]
      month += 1
      dates.push(m2(date) + '-' + m2(month) + '-' + year)
    }
  }

  return dates
}

const api = 'https://cdn-api.co-vin.in/api'

// Get states
const states = '/v2/admin/location/states'
// Get vaccination sessions by district
const findByDistrict = (district_id, date) =>
  '/v2/appointment/sessions/public/findByDistrict?district_id=' +
  district_id +
  '&date=' +
  date

// Get list of districts
const districts = (state_id) => '/v2/admin/location/districts/' + state_id
// Get vaccination sessions by district for 7 days
const calendarByDistrict = (district_id, date) =>
  '/v2/appointment/sessions/public/calendarByDistrict?district_id=' +
  district_id +
  '&date=' +
  date

const cowin = (data) => {
  const res = axios.get(api + data, {
    headers: {
      'User-Agent': 'Mozilla',
    },
  })
  return res
}

const getSlots = async (limit) => {
  try {
    const res = await cowin(districts(9))

    console.log(res.data.districts)

    for (district of res.data.districts) {
      const dates = futureDates(limit)
      for (date of dates) {
        const res = await cowin(calendarByDistrict(district.district_id, date))
        for (const center of res.data.centers) {
          for (const session of center.sessions) {
            if (
              session.min_age_limit === 18 &&
              session.available_capacity_dose1 > 0
            ) {
              axios.post(
                'https://api.telegram.org/bot1756916114:AAHutD0mn_OWLFyX6J43deLG0RY-hNLMjL8/sendMessage',
                {
                  chat_id: '@na53Nq',
                  text: {
                    Dose1: session.available_capacity_dose1,
                    Dose2: session.available_capacity_dose2,
                    Date: session.date,
                    Type: session.vaccine,
                    Center: center.name,
                    District: center.district_name,
                    PIN: center.pincode,
                    Fee: center.fee_type,
                    Age: session.min_age_limit,
                  },
                }
              )
            }
          }
        }
      }
    }
  } catch {
    axios.post(
      'https://api.telegram.org/bot1756916114:AAHutD0mn_OWLFyX6J43deLG0RY-hNLMjL8/sendMessage',
      {
        chat_id: '@na53Nq',
        text: 'Something went wrong!',
      }
    )
  }
}

cron.schedule('*/3 * * * *', () => {
  getSlots(16)
})
