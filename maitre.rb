require 'date'
require 'twilio-ruby'
require 'dotenv/load'

def send_sms(message)
    account_sid = ENV['TWILIO_ACCOUNT_SID']
    auth_token = ENV['TWILIO_AUTH_TOKEN']

    @client = Twilio::REST::Client.new(account_sid, auth_token)

    message = @client.messages.create(
        body: message,
        from: ENV['TWILIO_FROM_PHONE'],
        to: ENV['TWILIO_TO_PHONE']
    )
end

def verifier_les_places()
    print "Vérification à #{Time.now.strftime("%Y-%m-%d %H:%M")}..."
    ret = %x(node esclave.js)
    places_disponibles = ret.split("\n").filter { |line| line.include?("LIBRE") }.map { |line| line.split(" ")[0].gsub("#cJOURNEE", "") }

    return places_disponibles
end

def attendre_10_minutes()
    10.times do
        print "."
        sleep(60)
    end
    puts
end

loop do
    places_disponibles = verifier_les_places()

    if places_disponibles.length == 0
        puts "\e[31m — Aucunes places disponibles.\e[0m"
    else
        puts "\e[32m — #{places_disponibles.join(", ")} disponibles.\e[0m"
        send_sms("Places disponibles: #{places_disponibles.join(", ")}")
    end

    attendre_10_minutes()
end