<?php

namespace App\Notifications;

use App\Models\AdoptionApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdoptionApplicationStatusNotification extends Notification implements ShouldQueue
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
        $status = ucfirst($this->application->status->value);

        return (new MailMessage)
            ->subject("Application {$status}: {$listing->name}")
            ->greeting("Hi {$notifiable->name},")
            ->line("Your adoption application for {$listing->name} was {$this->application->status->value}.")
            ->action('View application', rtrim(config('app.frontend_url'), '/').'/applications')
            ->line('Thank you for using Purrfect Match!');
    }
}
