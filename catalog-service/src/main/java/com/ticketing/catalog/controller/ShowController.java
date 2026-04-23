package com.ticketing.catalog.controller;

import com.ticketing.catalog.constant.ApiPaths;
import com.ticketing.catalog.dto.CreateShowRequest;
import com.ticketing.catalog.dto.UpdateShowRequest;
import com.ticketing.catalog.entity.Show;
import com.ticketing.common.auth.JwtAuthSupport;
import com.ticketing.common.constant.HttpStatusCodes;
import com.ticketing.catalog.service.ShowService;
import com.ticketing.common.exception.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller for show catalog.
 * SRP: HTTP layer only; delegates to ShowService.
 * DIP: depends on ShowService interface.
 */
@RestController
@RequestMapping(ApiPaths.SHOWS)
@Tag(name = "Shows", description = "Show catalog API - browse available shows and venues")
@RequiredArgsConstructor
public class ShowController {

    private final ShowService showService;
    private final JwtAuthSupport jwtAuthSupport;

    @GetMapping
    @Operation(summary = "List all shows", description = "Returns all available shows in the catalog")
    @ApiResponse(responseCode = HttpStatusCodes.OK_STR, description = "Successfully retrieved show list")
    public List<Show> list() {
        return showService.findAll();
    }

    @GetMapping(ApiPaths.SHOW_BY_ID)
    @Operation(summary = "Get show by ID", description = "Returns a single show with its seats by ID")
    @ApiResponses({
            @ApiResponse(responseCode = HttpStatusCodes.OK_STR, description = "Show found"),
            @ApiResponse(responseCode = HttpStatusCodes.NOT_FOUND_STR, description = "Show not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public Show get(
            @Parameter(description = "Show ID", required = true, example = "507f1f77bcf86cd799439011")
            @PathVariable String id) {
        return showService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create show", description = "Creates a new show with seat layout (admin)")
    @ApiResponse(responseCode = HttpStatusCodes.CREATED_STR, description = "Show created")
    @ApiResponse(responseCode = HttpStatusCodes.BAD_REQUEST_STR, description = "Invalid request body",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    public Show create(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody @Valid CreateShowRequest request) {
        jwtAuthSupport.requireAdmin(authorization);
        return showService.create(request);
    }

    @PutMapping(ApiPaths.SHOW_BY_ID)
    @Operation(summary = "Update show", description = "Updates editable fields on an existing show (admin)")
    @ApiResponses({
            @ApiResponse(responseCode = HttpStatusCodes.OK_STR, description = "Show updated"),
            @ApiResponse(responseCode = HttpStatusCodes.BAD_REQUEST_STR, description = "Invalid request body",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = HttpStatusCodes.NOT_FOUND_STR, description = "Show not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public Show update(
            @Parameter(description = "Show ID", required = true, example = "507f1f77bcf86cd799439011")
            @PathVariable String id,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody @Valid UpdateShowRequest request) {
        jwtAuthSupport.requireAdmin(authorization);
        return showService.update(id, request);
    }
}
