<?php

namespace App\Notifications;

use App\Models\AdoptionApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewAdoptionApplicationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public AdoptionApplication $application) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $listing = $this->application->catListing;
        $adopter = $this->application->adopter;

        return (new MailMessage)
            ->subject("New adoption application for {$listing->name}")
            ->greeting("Hi {$notifiable->name},")
            ->line("{$adopter->name} applied to adopt {$listing->name}.")
            ->line('Message: '.$this->application->message)
            ->action('Review applications', rtrim(config('app.frontend_url'), '/')."/my-listings/{$listing->id}/applications")
            ->line('Thank you for using Purrfect Match!');
    }
}
